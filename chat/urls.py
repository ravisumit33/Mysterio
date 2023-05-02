from django.urls import path
from rest_framework import routers

import chat.views as ChatView

router = routers.DefaultRouter()
router.register(r"group_rooms", ChatView.GroupRoomViewSet, basename="group-room")
router.register(r"individual_rooms", ChatView.IndividualRoomViewSet, basename="individual-room")

urlpatterns = router.urls + [
    path("get_favorite_rooms/", ChatView.get_favorite_rooms, name="favorite_rooms"),
]

app_name = "chat"
