from django.contrib.auth.forms import AuthenticationForm as DjangoAuthenticationForm
from django.core.exceptions import ValidationError


class AuthenticationForm(DjangoAuthenticationForm):
    """
    Custom authentication form to use email as username and password
    """

    def get_invalid_login_error(self):
        return ValidationError(
            self.error_messages["invalid_login"],
            code="invalid_login",
            params={"username": "email"},
        )
