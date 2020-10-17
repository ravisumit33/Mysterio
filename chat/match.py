from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from chat.models.room import IndividualRoom
from chat.models.channel import IndividualChannel

def match():
    """Match Chat users
    """
    # TODO: make DB transactions atomic to remove case when
    # user disconnects in between
    try:
        unmatched_users = IndividualChannel.objects.filter(is_matched=False)
    except IndividualChannel.DoesNotExist:
        return
    channel_layer = get_channel_layer()
    for i in range(1, len(unmatched_users), 2):
        user1 = unmatched_users[i - 1]
        user2 = unmatched_users[i]
        new_room = IndividualRoom(name='Anonymous', channel1=user1, channel2=user2)
        user1.is_matched = user2.is_matched = True
        new_room.save()
        user1.save()
        user2.save()
        new_room_id_str = str(new_room.id)
        async_to_sync(channel_layer.group_add)(
            new_room_id_str,
            user1.channel_name
        )
        async_to_sync(channel_layer.group_add)(
            new_room_id_str,
            user2.channel_name
        )
        async_to_sync(channel_layer.group_send)(
            str(user1.id),
            {
                'type': 'group_msg_receive',
                'payload': {
                    'message': 'You are now connected',
                    'room_id': new_room_id_str,
                }
            }
        )
        async_to_sync(channel_layer.group_send)(
            str(user2.id),
            {
                'type': 'group_msg_receive',
                'payload': {
                    'message': 'You are now connected',
                    'room_id': new_room_id_str,
                }
            }
        )
