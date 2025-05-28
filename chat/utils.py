import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth.hashers import check_password
from django.db.models import Count, Q

from chat.models import Room

logger = logging.getLogger(__name__)


class ChannelLayerOps:
    """
    Manage all channel layer operations.
    """

    def __init__(self):
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

    def group_send_message(self, group, message_type, data):
        """
        Handle sending message to a group
        """
        async_to_sync(self.channel_layer.group_send)(
            group,
            {
                "type": "chat.message",
                "payload": {
                    "type": message_type,
                    "data": data,
                },
            },
        )

    def send_message(self, channel_name, message_type, data):
        """
        Handle sending message to a channel
        """
        async_to_sync(self.channel_layer.send)(
            channel_name,
            {
                "type": "chat.message",
                "payload": {
                    "type": message_type,
                    "data": data,
                },
            },
        )

    def send_match_room(self, channel_name, room_id):
        async_to_sync(self.channel_layer.send)(
            channel_name,
            {
                "type": "match.room",
                "room_id": room_id,
            },
        )


channel_layer = ChannelLayerOps()


def check_group_room_password(request, group_room_data):
    """
    Returns if request contains valid group room password
    """
    # TODO: Create a custom post action in case of protected rooms, which takes password in the body
    # to get rid of this custom header approach.
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
