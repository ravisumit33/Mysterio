import logging
from django.contrib.sessions.models import Session
from rest_framework import permissions
from chat.utils import check_group_password

logger = logging.getLogger(__name__)


class GroupRoomPermission(permissions.BasePermission):
    """
    Custom permissions for group room view set
    """

    def has_permission(self, request, view):
        if view.action == "create":
            return request.user.is_authenticated
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        password_valid = check_group_password(request, obj)
        get_permission_restricted = {
            "set_like": True,
            "update_player": request.user in obj.admins.all(),
            "destroy": request.user == obj.creator,
        }
        if view.action in ("retrieve", "get_player", "get_messages"):
            return password_valid
        if view.action in get_permission_restricted:
            remove_restriction = request.user.is_authenticated and password_valid
            return (
                get_permission_restricted[view.action] if remove_restriction else False
            )
        return False


class IndividualRoomPermission(permissions.BasePermission):
    """
    Custom permissions for individual room view set
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        chat_session_1 = obj.channel1.chat_session
        chat_session_2 = obj.channel2.chat_session
        chat_session_ids = (chat_session_1.id, chat_session_2.id)
        session = Session.objects.get(pk=request.session.session_key)
        matched_session_query = session.chat_sessions.filter(pk__in=chat_session_ids)
        return matched_session_query.exists()
