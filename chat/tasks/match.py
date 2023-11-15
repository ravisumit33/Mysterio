import logging

from django.db import transaction

from chat.constants import GroupPrefix, MessageType
from chat.models import Channel, MatchRequest, Room, RoomType
from chat.utils import channel_layer

logger = logging.getLogger(__name__)


def get_chat_sessions_data(channels):
    """Get stored session data for each channel"""
    return [channel.chat_session for channel in channels]


def match_channels(channels):
    """Algorithm for matching individual channels"""
    idx_pairs = []
    for i in range(1, len(channels), 2):
        # Currently matching serially
        idx_pairs.append((i - 1, i))
    return idx_pairs


def process_unmatched_channels():
    """Match individual channels and create rooms for them"""
    with transaction.atomic():
        match_requests = (
            MatchRequest.objects.select_for_update().filter(is_matched=False).order_by("created_at")
        )
        unmatched_channels = [match_request.channel for match_request in match_requests]
        channel_idx_pairs = match_channels(unmatched_channels)
        sessions_data = get_chat_sessions_data(unmatched_channels)

        individual_room_list = [Room(room_type=RoomType.INDIVIDUAL)] * len(channel_idx_pairs)
        individual_rooms = Room.objects.bulk_create(individual_room_list)

        matched_channels = [
            unmatched_channels[idx] for idx_pair in channel_idx_pairs for idx in idx_pair
        ]
        matched_requests = [
            match_requests[idx] for idx_pair in channel_idx_pairs for idx in idx_pair
        ]
        for i in range(0, len(matched_channels), 2):
            matched_channels[i].room_id = matched_channels[i + 1].room_id = individual_rooms[
                i // 2
            ].id
            matched_requests[i].is_matched = matched_requests[i + 1].is_matched = True
        Channel.objects.bulk_update(matched_channels, ["room_id"])
        MatchRequest.objects.bulk_update(matched_requests, ["is_matched"])

        for room_idx, channel_idx_pair in enumerate(channel_idx_pairs):
            room_id = individual_room_list[room_idx].id
            logger.info(
                "Room id %d is allocated to user ids %d and %d",
                room_id,
                unmatched_channels[channel_idx_pair[0]].id,
                unmatched_channels[channel_idx_pair[1]].id,
            )
            for i in range(2):
                channel = unmatched_channels[channel_idx_pair[i]]
                match_channel_idx = channel_idx_pair[1 - i]
                channel_layer.group_add(
                    GroupPrefix.INDIVIDUAL_ROOM + str(room_id),
                    channel.name,
                )
                channel_layer.group_send(
                    GroupPrefix.INDIVIDUAL_CHANNEL + str(channel.id),
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
