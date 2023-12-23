from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth.hashers import check_password
from django.db.models import Count, Q

from chat.models import Room


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


def check_group_room_password(request, group_room_data):
    """
    Returns if request contains valid group room password
    """
    request_password = request.META.get("HTTP_X_ROOM_PASSWORD", "")
    return (
        check_password(request_password, group_room_data.password)
        if group_room_data.is_protected
        else True
    )


def get_inactive_individual_room_qs(room_id):
    """
    Returns query set to get if individual room is inactive currently
    """

    return (
        Room.objects.filter(pk=room_id)
        .alias(active_channels_count=Count("channel", filter=Q(channel__is_active=True)))
        .filter(active_channels_count__lt=2)
    )
