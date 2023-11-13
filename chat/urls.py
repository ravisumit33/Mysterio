from django.urls import path
from rest_framework import routers

import chat.views as ChatView

router = routers.DefaultRouter()
router.register(r"rooms", ChatView.RoomViewSet, basename="room")
router.register(r"messages", ChatView.MessageViewSet, basename="message")
router.register(r"players", ChatView.PlayerViewSet, basename="player")

urlpatterns = router.urls + [
    path("get_favorite_rooms/", ChatView.get_favorite_rooms, name="favorite_rooms"),
]

app_name = "chat"
