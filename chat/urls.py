from rest_framework import routers
import chat.views as ChatView

router = routers.DefaultRouter()
router.register(r"groups", ChatView.GroupRoomViewSet)

urlpatterns = router.urls

app_name = "chat"
