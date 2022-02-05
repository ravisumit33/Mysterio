from rest_framework import routers
import chat.views as ChatView

router = routers.DefaultRouter()
router.register(r"group_rooms", ChatView.GroupRoomViewSet)
router.register(r"individual_rooms", ChatView.IndividualRoomViewSet)

urlpatterns = router.urls

app_name = "chat"
