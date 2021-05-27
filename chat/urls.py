from django.urls import path
from rest_framework import routers
import chat.views as ChatView

router = routers.SimpleRouter()
router.register(r"groups", ChatView.GroupRoomViewSet)

urlpatterns = router.urls + [
    path(
        "group_password_check/",
        ChatView.check_group_password,
        name="group_password_check",
    ),
]

app_name = "chat"
