import time
from datetime import datetime, timedelta

import redis
from celery import shared_task
from celery.utils.log import get_task_logger

from chat.constants import MATCH_DELAY, CacheKey
from chat.models.channel import IndividualChannel

from .match import process_unmatched_channels
from .trending_rooms import update_trending_rooms
from .group_room import delete_old_group_channels

logger = get_task_logger(__name__)


def _get_redis_connection():
    return redis.Redis(host="localhost", port=6379, db=0)


def match_channels():
    """
    Helper function to call match task. If no channel is already waiting schedule match task after
    MATCH_DELAY. This helps to improve randomization and reduce db calls. If channels are waiting
    for more than MATCH_DELAY, run match task instantly.
    """
    redis_cxn = _get_redis_connection()
    unmatched_channels_cnt = IndividualChannel.objects.filter(is_matched=False).count()
    last_match_timestamp_bytes = redis_cxn.get(CacheKey.LAST_MATCH_SCHEDULED_TIME)
    last_match_scheduled_time = datetime.fromtimestamp(
        float(last_match_timestamp_bytes if last_match_timestamp_bytes else 0)
    )
    if unmatched_channels_cnt == 1:
        redis_cxn.set(CacheKey.LAST_MATCH_SCHEDULED_TIME, time.time())
        _match_channels.apply_async(countdown=MATCH_DELAY)
    elif datetime.now() - last_match_scheduled_time > timedelta(seconds=MATCH_DELAY):
        _match_channels.delay()


@shared_task
def _match_channels():
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
