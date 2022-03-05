import logging
from django.db import transaction
from chat.utils import channel_layer
from chat.models.channel import IndividualChannel
from chat.models.chat_session import ChatSession
from chat.models.room import IndividualRoom
from chat.constants import MessageType, GroupPrefix

logger = logging.getLogger(__name__)


def get_chat_sessions_data(channels):
    """Get stored session data for each channel"""
    chat_session_ids = [channel["chat_session"] for channel in channels]
    chat_sessions = list(ChatSession.objects.filter(pk__in=chat_session_ids))
    chat_sessions.sort(key=lambda chat_session: chat_session_ids.index(chat_session.id))
    return chat_sessions


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
    with transaction.atomic():
        unmatched_channels = (
            IndividualChannel.objects.select_for_update()
            .filter(is_matched=False)
            .order_by("created_at")[
                :100
            ]  # TODO: set limit and scheduler interval after inspection
        )
        channels = unmatched_channels.values("id", "name", "chat_session")

        (channel_idx_pairs, matched_ids) = match_channels(channels)
        sessions_data = get_chat_sessions_data(channels)

        individual_room_list = []
        for channel_idx1, channel_idx2 in channel_idx_pairs:
            individual_room_list.append(
                IndividualRoom(
                    name="Anonymous",
                    channel1_id=channels[channel_idx1]["id"],
                    channel2_id=channels[channel_idx2]["id"],
                )
            )

        IndividualRoom.objects.bulk_create(individual_room_list)

        IndividualChannel.objects.filter(pk__in=matched_ids).update(is_matched=True)

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
