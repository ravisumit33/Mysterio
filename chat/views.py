from django.contrib.auth.hashers import check_password
from django.http import HttpResponse, JsonResponse
from django.db.utils import IntegrityError
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from chat.serializers import GroupRoomSerializer
from chat.models import GroupRoom
from chat.permissions import GroupRoomPermission


class GroupRoomViewSet(viewsets.ModelViewSet):  # pylint: disable=too-many-ancestors
    """
    API endpoint that allows group rooms to be created, viewed, listed, edited & deleted.
    """

    queryset = GroupRoom.objects.all()
    serializer_class = GroupRoomSerializer
    permission_classes = [GroupRoomPermission]


@api_view(["POST"])
@permission_classes([AllowAny])
def check_group_password(request):
    """
    Check password for group rooms
    """
    post_data = request.data
    group_id = post_data["id"]
    group_password = post_data["password"]

    try:
        group_room = GroupRoom.objects.get(id=group_id)
    except IntegrityError:
        return HttpResponse(status=400)
    if group_room.is_protected and group_password == "":
        return JsonResponse({"check": False, "password": ["This field is required."]})
    return JsonResponse({"check": check_password(group_password, group_room.password)})
