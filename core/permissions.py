from rest_framework import permissions


class UserPermission(permissions.BasePermission):
    """
    Custom permissions for user view set
    """

    def has_permission(self, request, view):
        if view.action == "create":
            return not request.user.is_authenticated
        return True

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if view.action == "destroy":
            return obj == request.user

        return False
