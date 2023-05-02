import json
import logging

from django.conf import settings
from django.urls import reverse_lazy

logger = logging.getLogger(__name__)


def add_jwt_cookie_to_request_body(get_response):
    """
    For some of the dj_rest_auth's POST endpoints JWT tokens are required in the body.
    Check for JWT_AUTH_REFRESH_COOKIE in the request.COOKIES.
    If there, move it to the body payload.
    """

    def middleware(request):
        if request.path in [
            reverse_lazy("customauth:token_verify"),
            reverse_lazy("customauth:token_refresh"),
            reverse_lazy("customauth:rest_logout"),
            reverse_lazy("customauth:user_delete"),
        ]:
            if request.body != b"":
                try:
                    data = json.loads(request.body)
                except json.JSONDecodeError:
                    logger.error("Content-Type should be json")
                    return get_response(request)
                if settings.JWT_AUTH_REFRESH_COOKIE in request.COOKIES:
                    data["refresh"] = request.COOKIES[settings.JWT_AUTH_REFRESH_COOKIE]
                if settings.JWT_AUTH_COOKIE in request.COOKIES:
                    data["token"] = request.COOKIES[settings.JWT_AUTH_COOKIE]
                request._body = json.dumps(data).encode("utf-8")
            else:
                logger.error("Request body should not be empty")
        return get_response(request)

    return middleware
