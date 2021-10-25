from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.views import (
    OAuth2CallbackView,
    OAuth2LoginView,
)

from google.auth.transport import requests
from google.oauth2 import id_token
from .provider import GoogleModifiedProvider


class GoogleOAuth2AdapterIdToken(GoogleOAuth2Adapter):
    """
    Adapter to support new google sign in apis
    """

    provider_id = GoogleModifiedProvider.id

    def complete_login(self, request, app, token, **kwargs):
        idinfo = id_token.verify_oauth2_token(
            token.token, requests.Request(), app.client_id
        )
        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Wrong issuer.")
        extra_data = idinfo
        login = self.get_provider().sociallogin_from_response(request, extra_data)
        return login


oauth2_login = OAuth2LoginView.adapter_view(GoogleOAuth2AdapterIdToken)
oauth2_callback = OAuth2CallbackView.adapter_view(GoogleOAuth2AdapterIdToken)
