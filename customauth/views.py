from django.views.generic.base import View
from django.http import HttpResponseRedirect
from rest_framework.decorators import api_view
from dj_rest_auth.views import LogoutView
from dj_rest_auth.registration.views import (
    SocialLoginView,
    VerifyEmailView as RestAuthVerifyEmailView,
)
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
    response = LogoutView.as_view()(request._request)  # pylint: disable=W0212
    request.user.delete()
    return response


class VerifyEmailView(View):
    """
    GET request to take user to site for verification
    POST request to confirm email
    """

    def get(self, request, key=None):
        """Redirect to frontend"""
        return HttpResponseRedirect(f"/account/confirm-email/{key}")

    def post(self, request, *args, **kwargs):
        """Post handler to confirm email"""
        rest_auth_view = RestAuthVerifyEmailView.as_view()
        return rest_auth_view(request, *args, **kwargs)
