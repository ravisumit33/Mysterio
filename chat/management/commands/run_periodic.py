import logging
from django.core.management import BaseCommand
from apscheduler.schedulers.blocking import BlockingScheduler
from chat.match import match

logger = logging.getLogger('mysterio')

def run_match():
    """Scheduled matching of unmatched users
    """
    logger.info('Periodic task started')
    scheduer = BlockingScheduler()
    # TODO: set appropiate time interval
    @scheduer.scheduled_job('interval', seconds=3)
    def timed_job():
        match()

    scheduer.start()

class Command(BaseCommand):
    """Custom command to run periodic tasks
    """

    def handle(self, *args, **kwargs):
        run_match()
