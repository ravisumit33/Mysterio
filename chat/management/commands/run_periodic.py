import logging
from django.core.management import BaseCommand
from apscheduler.schedulers.blocking import BlockingScheduler
from chat.match import process_unmatched_channels
from chat.trending_groups import update_trending_groups

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
    @process_scheduler.scheduled_job("interval", hours=4)
    def trending_groups_job():  # pylint: disable=W0612
        update_trending_groups()

    process_scheduler.start()


class Command(BaseCommand):
    """Custom command to run periodic tasks"""

    def handle(self, *args, **options):
        run_scheduler()
