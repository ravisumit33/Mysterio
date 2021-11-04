import logging
from django.conf import settings
from django.utils import timezone
from django.core.management import BaseCommand, call_command
from apscheduler.schedulers.blocking import BlockingScheduler
from django_apscheduler.jobstores import DjangoJobStore
from django_apscheduler.models import DjangoJobExecution
from django_apscheduler import util
from chat.tasks import (
    process_unmatched_channels,
    update_trending_rooms,
    delete_old_rooms,
)

logger = logging.getLogger(__name__)


def match_job():
    """Job for matching unmatched channels"""
    process_unmatched_channels()


def trending_rooms_job():
    """Job for updating trending rooms"""
    update_trending_rooms()
    logger.info("Trending rooms updated")


def old_rooms_job():
    """Job for deleting old rooms"""
    delete_old_rooms()
    logger.info("Old rooms deleted")


def flush_tokens_job():
    """Job for deleting expired tokens"""
    call_command("flushexpiredtokens")
    logger.info("Expired tokens flushed")


@util.close_old_connections
def delete_old_job_executions(max_age=604_800):
    """Job for deleting old job executions"""
    DjangoJobExecution.objects.delete_old_job_executions(max_age)
    logger.info("Old job DB connections closed")


def schedule_jobs(scheduler):
    """Schedule processing of periodic jobs"""

    # TODO: set appropiate time interval
    scheduler.add_job(
        match_job,
        trigger="interval",
        seconds=1,
        id="match",
        max_instances=10,
        replace_existing=True,
    )

    # TODO: set appropiate time interval
    scheduler.add_job(
        trending_rooms_job,
        trigger="interval",
        hours=12,
        id="trending_rooms",
        max_instances=1,
        replace_existing=True,
        next_run_time=timezone.now(),
    )

    scheduler.add_job(
        old_rooms_job,
        trigger="interval",
        days=1,
        id="old_rooms",
        max_instances=1,
        replace_existing=True,
        next_run_time=timezone.now(),
    )

    scheduler.add_job(
        flush_tokens_job,
        trigger="interval",
        days=1,
        id="flush_tokens",
        max_instances=1,
        replace_existing=True,
        next_run_time=timezone.now(),
    )

    scheduler.add_job(
        delete_old_job_executions,
        trigger="interval",
        weeks=1,
        id="old_execs",
        max_instances=1,
        replace_existing=True,
        next_run_time=timezone.now(),
    )


class Command(BaseCommand):
    """Custom command to run periodic tasks"""

    help = "Runs periodic tasks for mysterio"

    def handle(self, *args, **options):
        process_scheduler = BlockingScheduler(timezone=settings.TIME_ZONE)
        process_scheduler.add_jobstore(DjangoJobStore(), "default")
        schedule_jobs(process_scheduler)
        try:
            logger.debug("Starting periodic jobs")
            process_scheduler.start()
        except KeyboardInterrupt:
            process_scheduler.shutdown()
