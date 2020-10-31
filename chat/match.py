import logging
from django.db import transaction
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from chat.models.room import IndividualRoom
from chat.models.channel import IndividualChannel
from chat.constants import MESSAGE, PREFIX

logger = logging.getLogger(__name__)

def match_channels(channels):
    """Algorithm for matching individual channels
    """
    idx_pairs= []
    for i in range(1, len(channels), 2):
        # Currently matching serially
        idx_pairs.append((i-1, i))
    return idx_pairs

def process_unmatched_channels():
    """Match individual channels and create rooms for them
    """
    unmatched_channels = (
        IndividualChannel.objects
        .select_for_update()
        .filter(is_matched=False)
        .order_by('created_at')[:1000]  #TODO: set limit and scheduler interval after inspection
    )
    channel_layer = get_channel_layer()

    with transaction.atomic():
        channels = unmatched_channels.values('id', 'name')
        individual_room_list = []

        channel_idx_pairs = match_channels(channels)

        for channel_idx1, channel_idx2 in channel_idx_pairs:
            individual_room_list.append(
                IndividualRoom(
                    name='Anonymous',
                    channel1_id=channels[channel_idx1]['id'],
                    channel2_id=channels[channel_idx2]['id']
                )
            )

        IndividualRoom.objects.bulk_create(individual_room_list)

        channel_ids_list = [channel['id'] for channel in channels]
        if len(channel_ids_list) % 2:    # pop out unmatched channel
            channel_ids_list.pop()
        IndividualChannel.objects.filter(pk__in=channel_ids_list).update(is_matched=True)

        for room_idx, channel_idx_pair in enumerate(channel_idx_pairs):
            room_id = individual_room_list[room_idx].id
            logger.info(
                'Room id %d is allocated to user ids %d and %d',
                room_id,
                channels[channel_idx_pair[0]]['id'],
                channels[channel_idx_pair[1]]['id']
            )
            for channel_idx in channel_idx_pair:
                async_to_sync(channel_layer.group_add)(
                    PREFIX.INDIVIDUAL_ROOM + str(room_id),
                    channels[channel_idx]['name']
                )
                async_to_sync(channel_layer.group_send)(
                    PREFIX.INDIVIDUAL_CHANNEL + str(channels[channel_idx]['id']),
                    {
                        'type': 'group_msg_receive',
                        'payload': {
                            'type': MESSAGE.USER_JOINED,
                            'data': {
                                'room_id': room_id
                            }
                            #TODO: send user info who has joined
                        }
                    }
                )
