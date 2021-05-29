import json
from django.contrib.auth import get_user_model, authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.debug import sensitive_post_parameters
from django.middleware.csrf import get_token
from django.views.generic.base import View
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from rest_framework import viewsets, mixins
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from core.serializers import UserSerializer
from core.permissions import UserPermission


class UserViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):  # pylint: disable=too-many-ancestors

    """
    API endpoint that allows users to be created or deleted.
    """

    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [UserPermission]


class Login(View):
    """
    Login view
    """

    @method_decorator(csrf_protect)
    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        """
        GET method handler to return current user
        """
        user = request.user
        if request.user.is_authenticated:
            return JsonResponse({"username": user.username})
        return HttpResponse(status=200)

    @method_decorator(csrf_protect)
    @method_decorator(never_cache)
    @method_decorator(sensitive_post_parameters())
    def post(self, request, *args, **kwargs):
        """
        POST method handler to login user
        """
        if request.user.is_authenticated:
            return HttpResponse(status=400)

        post_data = json.loads(request.body.decode("utf-8"))
        login_form = AuthenticationForm(request, post_data)
        if login_form.errors:
            error_data = login_form.errors.get_json_data()
            json_response = {}
            status = 400
            if error_data.get("username"):
                json_response["username"] = [error_data["username"][0]["message"]]
            if error_data.get("password"):
                json_response["password"] = [error_data["password"][0]["message"]]
            if error_data.get("__all__"):
                json_response["__all__"] = [error_data["__all__"][0]["message"]]
                if error_data["__all__"][0]["code"] == "invalid_login":
                    status = 403
            return JsonResponse(
                json_response,
                status=status,
            )
        username = post_data["username"]
        password = post_data["password"]

        user = authenticate(
            request,
            username=username,
            password=password,
        )

        if not user:
            return HttpResponse(status=401)

        login(request, user)
        return JsonResponse({"username": user.username})


@api_view(["GET"])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """
    Set csrf cookie on get request
    """
    if (
        not "HTTP_SECRETKEY" in request.META
        or request.META.get("HTTP_SECRETKEY") != settings.SECRET_KEY
    ):
        return HttpResponse(status=400)
    csrf_token = get_token(request)
    response = HttpResponse(status=200)
    response.set_cookie("csrftoken", csrf_token)
    return response
