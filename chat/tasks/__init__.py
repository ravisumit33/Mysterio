from celery import shared_task
from celery.utils.log import get_task_logger
from .match import process_unmatched_channels
from .trending_rooms import update_trending_rooms
from .group_room import delete_old_group_channels

logger = get_task_logger(__name__)


@shared_task
def match_channels():
    """Shared task to match individual channels"""
    process_unmatched_channels()


@shared_task
def trending_rooms():
    """Shared task to update rooms zscore"""
    logger.debug("Trending rooms update started")
    update_trending_rooms()
    logger.info("Trending rooms updated")


@shared_task
def group_rooms():
    """Shared task to delete old group channels and rooms"""
    logger.debug("Deleting old group channels & rooms")
    delete_old_group_channels()
    logger.info("Old group channels & rooms deleted")
