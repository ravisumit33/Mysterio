from rest_framework.decorators import api_view
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.views import LogoutView
from dj_rest_auth.registration.views import SocialLoginView
from customauth.adapters import GoogleOAuth2AdapterIdToken


class GoogleLogin(SocialLoginView):
    """
    Login with Google
    """

    adapter_class = GoogleOAuth2AdapterIdToken
    client_class = OAuth2Client


@api_view(["POST"])
def delete_user(request):
    """
    Delete authenticated user
    """
    response = LogoutView.as_view()(request._request)  # pylint: disable=W0212
    request.user.delete()
    return response
