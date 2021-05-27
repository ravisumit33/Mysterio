from django.urls import path
from rest_framework import routers
import core.views as CoreView

router = routers.SimpleRouter()
router.register(r"users", CoreView.UserViewSet)

urlpatterns = router.urls + [
    path("login/", CoreView.Login.as_view(), name="login"),
    path("csrf/", CoreView.get_csrf_token, name="csrf_token"),
]

app_name = "core"
