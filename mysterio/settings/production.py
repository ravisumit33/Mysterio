from mysterio.settings.base import *  # pylint: disable=wildcard-import,unused-wildcard-import
from core import secret_manager

secret_manager.load_secrets()

SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = False

ALLOWED_HOSTS = [
    "www.mysterio-chat.com",
    "mysterio-chat.com",
    "mysterio-chat.herokuapp.com",
    "mysterio-env.eba-8drambpi.us-west-2.elasticbeanstalk.com",
]

if 'RDS_HOSTNAME' in os.environ:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ['RDS_DB_NAME'],
            'USER': os.environ['RDS_USERNAME'],
            'PASSWORD': os.environ['RDS_PASSWORD'],
            'HOST': os.environ['RDS_HOSTNAME'],
            'PORT': os.environ['RDS_PORT'],
        }
    }
else:
    raise Exception("Unable to connect to RDS")


CHANNEL_LAYERS["default"]["CONFIG"] = {
    "hosts": [os.getenv("REDIS_URL")],
}


STATICFILES_DIRS = [
    os.path.join(FRONTEND_DIR, "build", "static"),
]


CELERY_BROKER_URL = os.getenv("REDIS_URL")

CELERY_RESULT_BACKEND = os.getenv("REDIS_URL")


SITE_ID = 2

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
