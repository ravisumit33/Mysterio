from datetime import timedelta
from dotenv import load_dotenv
from mysterio.settings.base import *  # pylint: disable=wildcard-import,unused-wildcard-import

env_path = Path(".") / ".env"
load_dotenv(dotenv_path=env_path)

SECRET_KEY = "=8%vvj-i)i^=1@16^cevdpy(lc9_66!bq_w_hg*d1*nxnzow"

ALLOWED_HOSTS = ["*"]

DEBUG = True

TEMPLATE_DEBUG = True


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


SITE_ID = 2


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
    "django": {
        "level": "WARNING",
    },
}

LOGGING["handlers"]["console"]["formatter"] = "simple"


# Email SMTP server configurations

#  EMAIL_HOST = "localhost"

#  EMAIL_PORT = 1025
EMAIL_USE_TLS = True

EMAIL_HOST = "smtp.gmail.com"

EMAIL_PORT = 587

EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")

EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")


# AUTH configurations

SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"] = timedelta(minutes=60)


# Cors headers configurations

CORS_ORIGIN_WHITELIST = ("http://localhost:3000",)
