from email.mime.image import MIMEImage
from django.core.mail import EmailMultiAlternatives
from django.contrib.staticfiles.storage import staticfiles_storage
from django.template.loader import render_to_string
from allauth.account.adapter import DefaultAccountAdapter as RestAuthAccountAdapter
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


class AccountAdapter(RestAuthAccountAdapter):
    """
    Custom account adapter to render email template
    """

    def render_mail(self, template_prefix, email, context):
        to_email = [email] if isinstance(email, str) else email
        subject = render_to_string(f"{template_prefix}_subject.txt", context)
        # remove superfluous line breaks
        subject = " ".join(subject.splitlines()).strip()
        subject = self.format_email_subject(subject)
        from_email = self.get_from_email()
        html = render_to_string(
            f"{template_prefix}_message.html", context, self.request
        ).strip()
        msg = EmailMultiAlternatives(subject, html, from_email, to_email)
        msg.content_subtype = "html"
        msg.mixed_subtype = "related"
        img_path = staticfiles_storage.path("quick_chat.png")
        with open(img_path, "rb") as img_fp:
            img = MIMEImage(img_fp.read())
        img.add_header("Content-ID", "<logo>")
        msg.attach(img)
        return msg
