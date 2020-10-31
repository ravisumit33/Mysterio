import logging
from django.core.management import BaseCommand
from apscheduler.schedulers.blocking import BlockingScheduler
from chat.match import process_unmatched_channels

logger = logging.getLogger(__name__)

def run_scheduer():
    """Scheduled processing of unmatched channels
    """
    logger.info('Periodic task started')
    scheduer = BlockingScheduler()
    # TODO: set appropiate time interval
    @scheduer.scheduled_job('interval', seconds=1)
    def timed_job(): # pylint: disable=W0612
        process_unmatched_channels()

    scheduer.start()

class Command(BaseCommand):
    """Custom command to run periodic tasks
    """

    def handle(self, *args, **options):
        run_scheduer()
