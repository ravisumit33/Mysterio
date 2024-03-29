"""mysterio URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic.base import TemplateView
from customauth.views import VerifyEmailView

urlpatterns = [
    path("api/chat/", include("chat.urls", "chat")),
    path("api/account/", include("customauth.urls", "customauth")),
    path("admin/", admin.site.urls),
    path("api-auth/", include("rest_framework.urls")),
    path("accounts/", include("allauth.urls")),
    path(
        "robots.txt",
        TemplateView.as_view(template_name="robots.txt", content_type="text/plain"),
    ),
    # allauth requires following url name in global namespace
    # "account_confirm_email" for reverse resolving & handling requests from verification email
    re_path(
        r"^confirm-email/(?P<key>[-:\w]+)/$",
        VerifyEmailView.as_view(),
        name="account_confirm_email",
    ),
    path("", include("core.urls", "core")),
]
