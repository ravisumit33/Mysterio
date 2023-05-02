import os
from logging.config import dictConfig

from celery import Celery
from celery.signals import setup_logging
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysterio.settings.local")

app = Celery("mysterio")
app.config_from_object("django.conf:settings", namespace="CELERY")


@setup_logging.connect
def config_loggers(*args, **kwags):
    """
    Setup celery logging using django logging settings
    """

    dictConfig(settings.LOGGING)


app.autodiscover_tasks()
