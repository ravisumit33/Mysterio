from core import secret_manager

secret_manager.load_secrets()

import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.django import DjangoIntegration

from mysterio.settings.base import *

sentry_sdk.init(
    dsn="https://60df3a0a2de84c9ab6745f88ecf1e42e@o4505268225048576.ingest.sentry.io/4505268391378944",
    integrations=[
        DjangoIntegration(),
        CeleryIntegration(),
    ],
    traces_sample_rate=1.0,
)


DEBUG = False

ALLOWED_HOSTS = [
    "www.mysterio-chat.com",
    "mysterio-chat.com",
    "mysterio-env.eba-jmukjigp.ap-south-1.elasticbeanstalk.com",
]


TEMPLATES[0]["DIRS"] = [
    os.path.join(FRONTEND_DIR, "dist"),
]

STATICFILES_DIRS = [
    os.path.join(FRONTEND_DIR, "dist", "static"),
]


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
    "django": {
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
