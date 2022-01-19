from django.core.management import call_command
from celery.utils.log import get_task_logger
from celery import shared_task

logger = get_task_logger(__name__)


@shared_task
def flush_tokens():
    """Job for deleting expired tokens"""
    logger.debug("Going to flush expired tokens")
    call_command("flushexpiredtokens")
    logger.info("Expired tokens flushed")
