from django.urls import path

import chat.consumers as WebSocketConsumer

websocket_urlpatterns = [
    path("ws/chat/match/", WebSocketConsumer.ChatConsumer.as_asgi()),
    path("ws/chat/<str:room_type>/<int:room_id>/", WebSocketConsumer.ChatConsumer.as_asgi()),
]
