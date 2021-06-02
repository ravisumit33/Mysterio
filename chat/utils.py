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
