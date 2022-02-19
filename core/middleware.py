import logging
from django.http import HttpResponsePermanentRedirect

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


def redirect_herokuapp(get_response):
    """
    Redirect all requests from mysterio-chat.herokuapp.com to mysterio-chat.com
    """

    def middleware(request):
        host = request.get_host()
        if host == "mysterio-chat.herokuapp.com":
            redirect_url = (
                f"{request.scheme}://mysterio-chat.com{request.get_full_path()}"
            )
            return HttpResponsePermanentRedirect(redirect_url)
        return get_response(request)

    return middleware
