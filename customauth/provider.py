from allauth.account.models import EmailAddress
from allauth.socialaccount.providers.google.provider import GoogleProvider


class GoogleModifiedProvider(GoogleProvider):
    """
    Provider to support new google sign in apis
    """

    id = "google_modified"
    name = "Google Modified"

    def extract_uid(self, data):
        return str(data["sub"])

    def extract_email_addresses(self, data):
        ret = []
        email = data.get("email")
        if email and data.get("email_verified"):
            ret.append(EmailAddress(email=email, verified=True, primary=True))
        return ret


provider_classes = [GoogleModifiedProvider]
