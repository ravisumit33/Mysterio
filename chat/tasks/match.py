import logging
from django.db import transaction
from chat.utils import channel_layer
from chat.models.room import IndividualRoom
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
    for i in range(1, len(channels), 2):
        # Currently matching serially
        idx_pairs.append((i - 1, i))
    return idx_pairs


def process_unmatched_channels():
    """Match individual channels and create rooms for them"""
    unmatched_channels = (
        IndividualChannel.objects.select_for_update()
        .filter(is_matched=False)
        .order_by("created_at")[
            :1000
        ]  # TODO: set limit and scheduler interval after inspection
    )

    with transaction.atomic():
        channels = unmatched_channels.values("id", "name", "session")
        individual_room_list = []

        channel_idx_pairs = match_channels(channels)
        sessions_data = get_sessions_data(channels)

        for channel_idx1, channel_idx2 in channel_idx_pairs:
            individual_room_list.append(
                IndividualRoom(
                    name="Anonymous",
                    channel1_id=channels[channel_idx1]["id"],
                    channel2_id=channels[channel_idx2]["id"],
                )
            )

        IndividualRoom.objects.bulk_create(individual_room_list)

        channel_ids_list = [channel["id"] for channel in channels]
        if len(channel_ids_list) % 2:  # pop out unmatched channel
            channel_ids_list.pop()
        IndividualChannel.objects.filter(pk__in=channel_ids_list).update(
            is_matched=True
        )

        for room_idx, channel_idx_pair in enumerate(channel_idx_pairs):
            room_id = individual_room_list[room_idx].id
            logger.info(
                "Room id %d is allocated to user ids %d and %d",
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
