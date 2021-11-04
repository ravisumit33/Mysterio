import logging
from django.utils import timezone
from chat.models import GroupRoom

logger = logging.getLogger(__name__)


def delete_old_rooms():
    """
    Delete rooms older than a month
    """
    logger.debug("Deleting old rooms")
    one_month_ago = timezone.now() - timezone.timedelta(days=30)
    GroupRoom.objects.filter(created_at__lt=one_month_ago).delete()
