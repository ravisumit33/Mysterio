from django.urls import include, path
from rest_framework import routers
import chat.views as ChatView

router = routers.DefaultRouter()
router.register(r"groups", ChatView.GroupRoomViewSet)

urlpatterns = [
    path("", include(router.urls), name="drf_router"),
]
