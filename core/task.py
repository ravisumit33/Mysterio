from django.core.management import call_command
from celery.utils.log import get_task_logger
from celery import shared_task

logger = get_task_logger(__name__)


@shared_task
def backup_db():
    """Job for backing up db to s3"""
    logger.debug("Going to backup DB")
    call_command("backupdb")
    logger.info("DB backed up")
