from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from dj_rest_auth.views import LogoutView
from django.http import HttpResponseRedirect
from django.http.response import HttpResponseBadRequest
from django.views.generic.base import View
from rest_framework.decorators import api_view


class GoogleLogin(SocialLoginView):
    """
    Login with Google
    """

    adapter_class = GoogleOAuth2Adapter


@api_view(["POST"])
def delete_user(request):
    """
    Delete authenticated user
    """
    response = LogoutView.as_view()(request._request)
    request.user.delete()
    return response


class VerifyEmailView(View):
    """
    GET request to take user to site for email verification
    """

    def get(self, request, key=None):
        """Redirect to frontend"""
        if not key:
            HttpResponseBadRequest()
        return HttpResponseRedirect(f"/account/confirm-email/{key}")


class ResetPasswordView(View):
    """
    GET request to take user to site for password reset
    """

    def get(self, request, uid=None, token=None):
        """Redirect to frontend"""
        if not uid or not token:
            HttpResponseBadRequest()
        return HttpResponseRedirect(f"/account/reset-password/{uid}/{token}")
