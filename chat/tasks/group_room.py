import logging
from django.utils import timezone
from chat.models import GroupRoom

logger = logging.getLogger(__name__)


def delete_old_groups():
    """
    Delete groups older than a month
    """
    logger.info("Deleting old groups")
    one_month_ago = timezone.now() - timezone.timedelta(days=30)
    GroupRoom.objects.filter(created_at__lt=one_month_ago).delete()
