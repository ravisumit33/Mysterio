import logging
import uuid
import boto3
from botocore.exceptions import ClientError
from django.views.generic.base import TemplateView
from django.template.exceptions import TemplateDoesNotExist
from django.conf import settings
from django.http import Http404, HttpResponseRedirect
from django.template.loader import get_template
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

logger = logging.getLogger(__name__)


class FrontendView(TemplateView):
    """Frontend View
    Inherits django.views.generic.base.TemplateView to render index.html
    from Frontend App
    """

    template_name = "index.html"

    def get(self, request, *args, **kwargs):
        if settings.DEBUG:
            frontend_root_url = "http://localhost:3000"
            return HttpResponseRedirect(frontend_root_url + request.path)
        try:
            get_template(self.template_name)
            return super().get(request, *args, **kwargs)
        except TemplateDoesNotExist as exp:
            raise Http404(
                """
                This URL is only used when you have built the production
                version of the app. Visit https://localhost:3000/ instead, or
                run 'npm run build' to test the production version.
                """
            ) from exp


@api_view(["POST"])
@permission_classes([AllowAny])
def upload_avatar(request):
    """
    POST request to upload avatar
    """
    avatar_img = request.data.get("file", None)
    if not avatar_img:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    s3_client = boto3.client("s3")
    object_id = uuid.uuid4().hex
    try:
        s3_client.put_object(
            Body=avatar_img, Bucket="mysterio-user-avatars", Key=object_id
        )
    except ClientError as exp:
        logger.error(exp)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(
        {
            "url": f"https://mysterio-user-avatars.s3.ap-south-1.amazonaws.com/{object_id}"
        },
        status=status.HTTP_200_OK,
    )
