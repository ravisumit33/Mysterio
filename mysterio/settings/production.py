import dj_database_url
from mysterio.settings.base import *  # pylint: disable=wildcard-import,unused-wildcard-import

SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = False

ALLOWED_HOSTS = ["www.mysterio-chat.com", "mysterio-chat.com"]

DATABASES = {"default": dj_database_url.config(conn_max_age=600, ssl_require=True)}


CHANNEL_LAYERS["default"]["CONFIG"] = {
    "hosts": [os.getenv("REDIS_URL")],
}


STATICFILES_DIRS = [
    os.path.join(FRONTEND_DIR, "build", "static"),
]


CELERY_BROKER_URL = os.getenv("REDIS_URL")

CELERY_RESULT_BACKEND = os.getenv("REDIS_URL")


SITE_ID = 2


LOGGING["handlers"]["console"]["formatter"] = "verbose"


REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = ("rest_framework.renderers.JSONRenderer",)


# TODO Fix these after moving to native mobile app

CSRF_COOKIE_SECURE = True

SESSION_COOKIE_SECURE = True

CSRF_COOKIE_SAMESITE = "None"

SESSION_COOKIE_SAMESITE = "None"


# Email SMTP server configurations

EMAIL_USE_TLS = True

EMAIL_HOST = "smtp.office365.com"

EMAIL_PORT = 587

EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")

EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
