import logging
from django.http import HttpResponse

logger = logging.getLogger(__name__)


def set_ws_on_session(get_response):
    """
    Set dummy value for web socket on session to save it in db.
    This is required to access session in consumers.
    https://github.com/django/channels/issues/1096#issuecomment-619590028
    """

    def middleware(request):
        if not request.session.get("ws", False):
            request.session["ws"] = True
            request.session.save()
        return get_response(request)

    return middleware


def aws_health_check_middleware(
    get_response,
):  # https://stackoverflow.com/a/64623669/6842304
    """
    Respond to AWS ELB health checks. ELB does not set HTTP_HOST header.
    Response is sent before ALLOWED_HOSTS is checked.
    """

    def middleware(request):
        if request.path == "/health":
            return HttpResponse("ok")
        return get_response(request)

    return middleware
