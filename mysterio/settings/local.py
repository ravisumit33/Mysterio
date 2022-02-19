from datetime import timedelta
from dotenv import load_dotenv
from mysterio.settings.base import *  # pylint: disable=wildcard-import,unused-wildcard-import

env_path = Path(".") / ".env"
load_dotenv(dotenv_path=env_path)

SECRET_KEY = "=8%vvj-i)i^=1@16^cevdpy(lc9_66!bq_w_hg*d1*nxnzow"

ALLOWED_HOSTS = ["*"]

DEBUG = True

TEMPLATE_DEBUG = True

INSTALLED_APPS.append("django_extensions")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": "localhost",
        "PORT": "5432",
    }
}


CHANNEL_LAYERS["default"]["CONFIG"] = {
    "hosts": ["redis://127.0.0.1:6379"],
}


CELERY_BROKER_URL = "redis://127.0.0.1:6379"

CELERY_RESULT_BACKEND = "redis://127.0.0.1:6379"


SITE_ID = 4


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
}

LOGGING["handlers"]["console"]["formatter"] = "simple"


#  Email SMTP server configurations

EMAIL_HOST = "localhost"

EMAIL_PORT = 1025


# AUTH configurations

SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"] = timedelta(minutes=60)


# Cors headers configurations

CORS_ORIGIN_WHITELIST = ("http://localhost:3000",)
