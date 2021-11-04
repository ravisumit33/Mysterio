import logging
import uuid
from django.db import transaction
from chat.utils import channel_layer
from chat.models.channel import IndividualChannel
from chat.models.session import ChatSession
from chat.constants import MessageType, GroupPrefix

logger = logging.getLogger(__name__)


def get_sessions_data(channels):
    """Get stored session data for each channel"""
    session_ids = [channel["session"] for channel in channels]
    sessions = list(ChatSession.objects.filter(pk__in=session_ids))
    sessions.sort(key=lambda session: session_ids.index(session.id))
    return sessions


def match_channels(channels):
    """Algorithm for matching individual channels"""
    idx_pairs = []
    matched_ids = []
    for i in range(1, len(channels), 2):
        # Currently matching serially
        idx_pairs.append((i - 1, i))
        matched_ids.extend([channels[i - 1]["id"], channels[i]["id"]])
    return (idx_pairs, matched_ids)


def process_unmatched_channels():
    """Match individual channels and create rooms for them"""
    unmatched_channels = (
        IndividualChannel.objects.select_for_update()
        .filter(is_matched=False)
        .order_by("created_at")[
            :100
        ]  # TODO: set limit and scheduler interval after inspection
    )

    with transaction.atomic():
        channels = unmatched_channels.values("id", "name", "session")

        (channel_idx_pairs, matched_ids) = match_channels(channels)
        sessions_data = get_sessions_data(channels)

        IndividualChannel.objects.filter(pk__in=matched_ids).update(is_matched=True)

        for channel_idx_pair in channel_idx_pairs:
            room_id = str(uuid.uuid4())
            logger.info(
                "Room id %s is allocated to user ids %d and %d",
                room_id,
                channels[channel_idx_pair[0]]["id"],
                channels[channel_idx_pair[1]]["id"],
            )
            for i in range(2):
                channel = channels[channel_idx_pair[i]]
                match_channel_idx = channel_idx_pair[1 - i]
                channel_layer.group_add(
                    GroupPrefix.INDIVIDUAL_ROOM + str(room_id),
                    channel["name"],
                )
                channel_layer.group_send(
                    GroupPrefix.INDIVIDUAL_CHANNEL + str(channel["id"]),
                    MessageType.USER_JOINED,
                    {
                        "room_id": room_id,
                        "match": {
                            "id": sessions_data[match_channel_idx].session_id,
                            "name": sessions_data[match_channel_idx].name,
                            "avatarUrl": sessions_data[match_channel_idx].avatar_url,
                        },
                    },
                )
