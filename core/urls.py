from django.conf import settings
from django.urls import re_path
from . import views as CoreViews

frontend_routes = settings.FRONTEND_ROUTES

urlpatterns = [
    re_path(
        r"^(%s)?$" % "|".join(frontend_routes),  # pylint: disable=C0209
        CoreViews.FrontendView.as_view(),
    ),
]

app_name = "core"
