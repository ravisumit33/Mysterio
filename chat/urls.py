from rest_framework import routers
import chat.views as ChatView

router = routers.SimpleRouter()
router.register(r"groups", ChatView.GroupRoomViewSet)
router.register(r"messages", ChatView.MessageViewSet, basename="message")
router.register(r"group_channels", ChatView.GroupChannelViewSet)
router.register(r"sessions", ChatView.SessionViewSet, basename="session")

urlpatterns = router.urls

app_name = "chat"
