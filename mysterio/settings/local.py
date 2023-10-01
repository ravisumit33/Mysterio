from datetime import timedelta
from pathlib import Path

from corsheaders.defaults import default_headers
from dotenv import load_dotenv

env_path = Path(".") / ".env"
load_dotenv(dotenv_path=env_path)

from mysterio.settings.base import *

SECRET_KEY = "=8%vvj-i)i^=1@16^cevdpy(lc9_66!bq_w_hg*d1*nxnzow"

ALLOWED_HOSTS = ["*"]

DEBUG = True

TEMPLATE_DEBUG = True

INSTALLED_APPS.append("django_extensions")

TEMPLATES[0]["DIRS"] = [
    os.path.join(FRONTEND_DIR, "public"),
]

STATICFILES_DIRS = [
    os.path.join(FRONTEND_DIR, "public", "static"),
]

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


#  Email SMTP server configurations

EMAIL_HOST = "localhost"

EMAIL_PORT = 1025

# AUTH configurations

SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"] = timedelta(minutes=60)


# Cors headers configurations

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

CORS_ALLOW_HEADERS = list(default_headers) + [
    "x-group-password",
]
