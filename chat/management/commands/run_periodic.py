import logging
from django.utils import timezone
from django.core.management import BaseCommand
from apscheduler.schedulers.blocking import BlockingScheduler
from chat.tasks import (
    process_unmatched_channels,
    update_trending_groups,
    delete_old_groups,
)

logger = logging.getLogger(__name__)


def run_scheduler():
    """Scheduled processing of periodic jobs"""
    logger.info("Periodic task started")

    process_scheduler = BlockingScheduler()
    # TODO: set appropiate time interval
    @process_scheduler.scheduled_job("interval", seconds=1)
    def match_job():  # pylint: disable=W0612
        process_unmatched_channels()

    # TODO: set appropiate time interval
    @process_scheduler.scheduled_job("interval", hours=4, next_run_time=timezone.now())
    def trending_groups_job():  # pylint: disable=W0612
        update_trending_groups()

    @process_scheduler.scheduled_job("interval", days=1, next_run_time=timezone.now())
    def group_room_job():  # pylint: disable=W0612
        delete_old_groups()

    process_scheduler.start()


class Command(BaseCommand):
    """Custom command to run periodic tasks"""

    def handle(self, *args, **options):
        run_scheduler()
