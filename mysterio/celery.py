import os
from celery import Celery
from celery.signals import worker_ready

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysterio.settings.local")

app = Celery("mysterio")
app.config_from_object("django.conf:settings", namespace="CELERY")
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
