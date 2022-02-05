import os
from logging.config import dictConfig
from django.conf import settings
from celery import Celery
from celery.signals import worker_ready, setup_logging

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysterio.settings.local")

app = Celery("mysterio")
app.config_from_object("django.conf:settings", namespace="CELERY")


@setup_logging.connect
def config_loggers(*args, **kwags):  # pylint: disable=unused-argument
    """
    Setup celery logging using django logging settings
    """

    dictConfig(settings.LOGGING)


app.autodiscover_tasks()


@worker_ready.connect
def at_start(sender, **kwargs):
    """
    Run periodic tasks at start. This has been done to overcome heroku dyno sleep issue.
    """
    with sender.app.connection() as conn:
        sender.app.send_task("chat.tasks.trending_rooms", connection=conn)
        sender.app.send_task("chat.tasks.group_rooms", connection=conn)
        sender.app.send_task("customauth.tasks.flush_tokens", connection=conn)
