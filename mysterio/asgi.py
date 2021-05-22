"""
ASGI config for mysterio project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

# pylint: disable=wrong-import-position
from channels.routing import (
    ProtocolTypeRouter,
    URLRouter,
)
from channels.sessions import SessionMiddlewareStack
import chat.routing

# pylint: enable=wrong-import-position

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysterio.settings.local")

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": SessionMiddlewareStack(
            URLRouter(chat.routing.websocket_urlpatterns)
        ),
    }
)
