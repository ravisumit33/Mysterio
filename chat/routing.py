from django.urls import path

import chat.consumers as WebSocketConsumer

websocket_urlpatterns = [
    path("ws/chat/", WebSocketConsumer.ChatConsumer.as_asgi()),
    path("ws/chat/<room_id>/", WebSocketConsumer.ChatConsumer.as_asgi()),
]
