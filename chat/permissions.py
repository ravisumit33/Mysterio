import logging

from django.contrib.sessions.models import Session
from rest_framework import permissions

from chat.models import Room
from chat.utils import check_group_room_password

logger = logging.getLogger(__name__)


def has_basic_room_permission(request, room, only_allow_active=True):
    has_perm = True
    if room.is_group_room:
        has_perm = has_perm and check_group_room_password(request, room.room_data)
    if only_allow_active:
        active_chat_session = Session.objects.filter(
            pk=request.session.session_key,
            chat_session__channel__is_active=True,
            chat_session__channel__room_id=room.id,
        )
        has_perm = has_perm and active_chat_session.exists()
    return has_perm


class RoomPermission(permissions.BasePermission):
    """
    Custom permissions for room view set
    """

    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        if view.action in ("create", "list"):
            if view.action == "create":
                room_type = request.data.get("room_type", None)
            else:
                room_type = request.query_params.get("search", None)
            if room_type not in (Room.GROUP, Room.INDIVIDUAL):
                return False
            restricted_actions_perms = {
                Room.GROUP: {
                    "create": request.user.is_authenticated,
                },
                Room.INDIVIDUAL: {
                    "create": False,
                    "list": False,
                },
            }
            restricted_room_perms = restricted_actions_perms[room_type]
            if view.action in restricted_room_perms:
                return restricted_room_perms[view.action]
        return True

    def has_object_permission(self, request, view, room):
        if request.user.is_superuser:
            return True
        room_type = room.room_type
        has_basic_perm = has_basic_room_permission(request, room)
        has_room_data = hasattr(room, "room_data")
        restricted_actions_perms = {
            Room.GROUP: {
                "retrieve": has_basic_perm,
                "destroy": has_basic_room_permission(request, room, only_allow_active=False)
                and has_room_data
                and request.user == room.room_data.creator,
                "update": False,
                "partial_update": False,
            },
            Room.INDIVIDUAL: {
                "retrieve": has_basic_perm,
                "destroy": False,
                "update": False,
                "partial_update": False,
            },
        }
        restricted_room_perms = restricted_actions_perms[room_type]
        if view.action in restricted_room_perms:
            return restricted_room_perms[view.action]
        return has_basic_perm
        #  get_permission_restricted = {
        #  "set_like": True,
        #  }
        #  if view.action in ("retrieve", "get_player", "get_messages"):
        #  return password_valid
        #  if view.action in get_permission_restricted:
        #  remove_restriction = request.user.is_authenticated and password_valid
        #  return get_permission_restricted[view.action] if remove_restriction else False
        #  return False


class MessagePermission(permissions.BasePermission):
    """
    Custom permissions for message view set
    """

    def has_object_permission(self, request, view, msg):
        if request.user.is_superuser:
            return True
        return has_basic_room_permission(request, msg.room)


class PlayerPermission(permissions.BasePermission):
    """
    Custom permissions for player view set
    """

    def has_object_permission(self, request, view, player):
        if request.user.is_superuser:
            return True
        room = player.room
        has_perm = has_basic_room_permission(request, room)
        if view.action == "retrieve":
            return has_perm
        if view.action in ["update", "partial_update"]:
            if room.is_group_room:
                has_perm = has_perm and request.user in room.room_data.admins.all()
            host_chat_session = Session.objects.filter(
                pk=request.session.session_key, chat_session__id=player.host.id
            )
            has_perm = has_perm and host_chat_session.exists()
            return has_perm
        return False
