from email.mime.image import MIMEImage

from allauth.account.adapter import DefaultAccountAdapter as RestAuthAccountAdapter
from allauth.utils import build_absolute_uri
from django.conf import settings
from django.contrib.staticfiles.storage import staticfiles_storage
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.urls.base import reverse


class AccountAdapter(RestAuthAccountAdapter):
    """
    Custom account adapter to render email template
    """

    def render_mail(self, template_prefix, email, context, headers=None):
        to_email = [email] if isinstance(email, str) else email
        subject = render_to_string(f"{template_prefix}_subject.txt", context)
        # remove superfluous line breaks
        subject = " ".join(subject.splitlines()).strip()
        subject = self.format_email_subject(subject)
        from_email = self.get_from_email()
        frontend_url = reverse("core:frontend")
        if settings.DEBUG:
            frontend_root_url = "http://localhost:3000"
            frontend_url = frontend_root_url + frontend_url
        else:
            frontend_url = build_absolute_uri(self.request, frontend_url)
        context["frontend_url"] = frontend_url
        html = render_to_string(f"{template_prefix}_message.html", context, self.request).strip()
        msg = EmailMultiAlternatives(subject, html, from_email, to_email, headers=headers)
        msg.content_subtype = "html"
        msg.mixed_subtype = "related"
        img_path = staticfiles_storage.path("quick_chat.png")
        with open(img_path, "rb") as img_fp:
            img = MIMEImage(img_fp.read())
        img.add_header("Content-ID", "<logo>")
        msg.attach(img)
        return msg
