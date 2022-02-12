from .production import *  # pylint: disable=wildcard-import,unused-wildcard-import

ALLOWED_HOSTS = [".herokuapp.com"]


LOGGING["loggers"] = {
    "mysterio": {
        "level": "DEBUG",
    },
    "chat": {
        "level": "DEBUG",
    },
    "core": {
        "level": "DEBUG",
    },
    "customauth": {
        "level": "DEBUG",
    },
    "celery.task": {
        "level": "INFO",
    },
    "django": {
        "level": "WARNING",
    },
}

LOGGING["handlers"]["console"]["formatter"] = "simple"
