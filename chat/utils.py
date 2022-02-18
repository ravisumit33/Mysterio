from django.contrib.auth.hashers import check_password
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


class ChannelLayerOps:
    """
    Manage all channel layer operations.
    """

    def __init__(self):
        self.type = "group_msg_receive"
        self.channel_layer = get_channel_layer()

    def group_add(self, group, channel_name):
        """
        Handle group add
        """
        async_to_sync(self.channel_layer.group_add)(group, channel_name)

    def group_discard(self, group, channel_name):
        """
        Handle group discard
        """
        async_to_sync(self.channel_layer.group_discard)(group, channel_name)

    def group_send(self, group, message_type, data):
        """
        Handle group send
        """
        async_to_sync(self.channel_layer.group_send)(
            group,
            {
                "type": self.type,
                "payload": {
                    "type": message_type,
                    "data": data,
                },
            },
        )


channel_layer = ChannelLayerOps()


def check_group_password(request, group_room):
    """
    Returns if request contains valid group room password
    """
    request_password = request.META.get("HTTP_X_GROUP_PASSWORD", "")
    return (
        check_password(request_password, group_room.password)
        if group_room.is_protected
        else True
    )
