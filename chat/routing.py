from django.urls import path
import chat.consumers as WebSocketConsumer

websocket_urlpatterns = [
    path('ws/chat', WebSocketConsumer.ChatConsumer),
    path('ws/chat/<int:room_id>', WebSocketConsumer.ChatConsumer),
]
