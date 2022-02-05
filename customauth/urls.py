from django.urls import path
from django.urls.conf import include
import customauth.views as CustomAuthViews

urlpatterns = [
    path("google/login/", CustomAuthViews.GoogleLogin.as_view(), name="google_login"),
    path("delete/", CustomAuthViews.delete_user, name="user_delete"),
    path("registration/", include("dj_rest_auth.registration.urls")),
    path("", include("dj_rest_auth.urls")),
]

app_name = "customauth"
