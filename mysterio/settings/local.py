from dotenv import load_dotenv
from mysterio.settings.base import *  # pylint: disable=wildcard-import,unused-wildcard-import

env_path = Path(".") / ".env"
load_dotenv(dotenv_path=env_path)

SECRET_KEY = "=8%vvj-i)i^=1@16^cevdpy(lc9_66!bq_w_hg*d1*nxnzow"

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

LOGGING["loggers"] = {
    "mysterio": {
        "level": "DEBUG",
    },
    "chat": {
        "level": "DEBUG",
    },
    "django": {
        "level": "WARNING",
    },
}

LOGGING["handlers"]["console"]["formatter"] = "simple"

ALLOWED_HOSTS = ["*"]
