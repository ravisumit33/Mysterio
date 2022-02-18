from email.mime.image import MIMEImage
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMultiAlternatives
from django.contrib.staticfiles.storage import staticfiles_storage
from django.template.loader import render_to_string
from django.urls.base import reverse
from allauth.utils import build_absolute_uri
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

    def send_confirmation_mail(self, request, emailconfirmation, signup):
        current_site = get_current_site(request)
        frontend_url = reverse("core:frontend")
        print(settings.DEBUG)
        if settings.DEBUG:
            frontend_root_url = "http://localhost:3000"
            frontend_url = frontend_root_url + frontend_url
        else:
            frontend_url = build_absolute_uri(request, frontend_url)
        activate_url = reverse("account_confirm_email", args=[emailconfirmation.key])
        activate_url = build_absolute_uri(request, activate_url)
        ctx = {
            "user": emailconfirmation.email_address.user,
            "activate_url": activate_url,
            "frontend_url": frontend_url,
            "current_site": current_site,
            "key": emailconfirmation.key,
        }
        if signup:
            email_template = "account/email/email_confirmation_signup"
        else:
            email_template = "account/email/email_confirmation"
        self.send_mail(email_template, emailconfirmation.email_address.email, ctx)

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
