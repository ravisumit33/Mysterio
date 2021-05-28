from django.contrib.auth.hashers import check_password
from rest_framework import permissions


class GroupRoomPermission(permissions.BasePermission):
    """
    Custom permissions for group room view set
    """

    def has_permission(self, request, view):
        if view.action == "create":
            return request.user.is_authenticated
        return True

    def has_object_permission(self, request, view, obj):
        if view.action == "retrieve":
            return check_password(request.GET.get("password", ""), obj.password)

        if not request.user.is_authenticated:
            return False

        return obj.admin == request.user or request.user.is_superuser
