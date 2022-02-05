import logging
from django.contrib.sessions.models import Session
from django.contrib.auth.hashers import check_password
from rest_framework import permissions

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
        if view.action == "retrieve":
            return (
                check_password(
                    request.META.get("HTTP_X_GROUP_PASSWORD", ""), obj.password
                )
                if obj.password
                else True
            )
        if not request.user.is_authenticated:
            return False
        return request.user in obj.admins.all()


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
