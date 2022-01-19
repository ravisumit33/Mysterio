from django.utils import timezone
from chat.models import GroupRoom


def delete_old_rooms():
    """
    Delete rooms older than a month
    """
    one_month_ago = timezone.now() - timezone.timedelta(days=30)
    GroupRoom.objects.filter(created_at__lt=one_month_ago).delete()
