from dj_rest_auth.registration.views import SocialLoginView
from dj_rest_auth.views import LogoutView
from django.http import HttpResponseRedirect
from django.http.response import HttpResponseBadRequest
from django.views.generic.base import View
from rest_framework.decorators import api_view

from customauth.adapter import GoogleOAuth2AdapterIdToken


class GoogleLogin(SocialLoginView):
    """
    Login with Google
    """

    adapter_class = GoogleOAuth2AdapterIdToken


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
    GET request to take user to site for verification
    """

    def get(self, request, key=None):
        """Redirect to frontend"""
        if not key:
            HttpResponseBadRequest()
        return HttpResponseRedirect(f"/account/confirm-email/{key}")
