import requests
import dj_database_url
from core import secret_manager

secret_manager.load_secrets()

from mysterio.settings.base import *  # pylint: disable=wildcard-import,unused-wildcard-import,wrong-import-position

DEBUG = False

ALLOWED_HOSTS = [
    "www.mysterio-chat.com",
    "mysterio-chat.com",
    "mysterio-env.eba-jmukjigp.ap-south-1.elasticbeanstalk.com",
]

try:
    aws_local_ip = requests.get(
        "http://169.254.169.254/latest/meta-data/local-ipv4", timeout=0.01
    ).text
    ALLOWED_HOSTS.append(aws_local_ip)
except requests.exceptions.ConnectionError:
    pass

DATABASES = {"default": dj_database_url.config(conn_max_age=600)}

CHANNEL_LAYERS["default"]["CONFIG"] = {
    "hosts": [os.getenv("REDIS_URL")],
}

TEMPLATES[0]["DIRS"] = [
    os.path.join(FRONTEND_DIR, "dist"),
]

STATICFILES_DIRS = [
    os.path.join(FRONTEND_DIR, "dist", "static"),
]


CELERY_BROKER_URL = os.getenv("REDIS_URL")

CELERY_RESULT_BACKEND = os.getenv("REDIS_URL")


SITE_ID = 3

LOGGING["loggers"] = {
    "mysterio": {
        "level": "INFO",
    },
    "chat": {
        "level": "INFO",
    },
    "core": {
        "level": "INFO",
    },
    "customauth": {
        "level": "INFO",
    },
    "celery.task": {
        "level": "INFO",
    },
    "daphne": {
        "level": "WARNING",
    },
}

LOGGING["handlers"]["console"]["formatter"] = "verbose"


REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = ("rest_framework.renderers.JSONRenderer",)


# TODO Fix these after moving to native mobile app

CSRF_COOKIE_SECURE = True

SESSION_COOKIE_SECURE = True

CSRF_COOKIE_SAMESITE = "None"

SESSION_COOKIE_SAMESITE = "None"


# Email SMTP server configurations

EMAIL_USE_TLS = True

EMAIL_HOST = "smtp.gmail.com"

EMAIL_PORT = 587

EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")

EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
