from rest_framework import routers
import core.views as CoreView

router = routers.SimpleRouter()
router.register(r"users", CoreView.UserViewSet)

urlpatterns = router.urls

app_name = "core"
