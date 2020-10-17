from django.urls import re_path
import chat.consumers as WebSocketConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat$', WebSocketConsumer.ChatConsumer),
]
