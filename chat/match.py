from django.db import transaction
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from chat.models.room import IndividualRoom
from chat.models.channel import IndividualChannel
from chat.constants import MESSAGE, PREFIX

def match():
    """Match Chat users
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
        rooms_allocated = []

        # Matching algorithm
        for i in range(1, len(channels), 2):
            individual_room_list.append(
                IndividualRoom(
                    name='Anonymous',
                    channel1_id=channels[i-1]['id'],
                    channel2_id=channels[i]['id']
                )
            )
            # Currently allocating rooms serially
            rooms_allocated.append(i//2)
            rooms_allocated.append(i//2)

        IndividualRoom.objects.bulk_create(individual_room_list)

        channel_ids_list = [channel['id'] for channel in channels]
        if len(channel_ids_list) % 2:    # pop out unmatched channel
            channel_ids_list.pop()
        IndividualChannel.objects.filter(pk__in=channel_ids_list).update(is_matched=True)

        for channel_idx, room_idx in enumerate(rooms_allocated):
            room_id = individual_room_list[room_idx].id
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
