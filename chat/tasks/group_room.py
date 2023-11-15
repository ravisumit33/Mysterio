from django.db.models.aggregates import Count, Max
from django.utils import timezone

from chat.models import Channel, Room, RoomType


def delete_old_group_channels():
    """
    Delete messages and corresponding group channels older than 6 months
    And then delete group rooms with no channel
    """
    six_months_ago = timezone.localtime() - timezone.timedelta(days=6 * 30)
    Channel.objects.alias(latest_activity=Max("message__sent_at")).filter(
        latest_activity__lte=six_months_ago
    ).delete()  # No need to filter for group channels as they are the only ones with old messages
    Room.objects.filter(room_type=RoomType.GROUP).alias(channel_count=Count("channel")).filter(
        channel_count=0
    ).delete()
