from django.db.models.aggregates import Count, Max
from django.utils import timezone

from chat.models import GroupChannel, GroupRoom


def delete_old_group_channels():
    """
    Delete messages and corresponding group channels older than 6 months
    And then delete group rooms with no channel
    """
    six_months_ago = timezone.localtime() - timezone.timedelta(days=6 * 30)
    GroupChannel.objects.annotate(latest_activity=Max("message__sent_at")).filter(
        latest_activity__lte=six_months_ago
    ).delete()
    GroupRoom.objects.annotate(channel_count=Count("group_channel")).filter(
        channel_count=0
    ).delete()
