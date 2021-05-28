import dj_database_url
from mysterio.settings.base import *  # pylint: disable=W0614,W0401

SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = False

ALLOWED_HOSTS = ["mysterio-chat.herokuapp.com"]

DATABASES = {"default": dj_database_url.config(conn_max_age=600, ssl_require=True)}

CHANNEL_LAYERS["default"]["CONFIG"] = {
    "hosts": [os.getenv("REDIS_URL")],
}

LOGGING["handlers"]["console"]["formatter"] = "verbose"

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ("rest_framework.renderers.JSONRenderer",)
}
