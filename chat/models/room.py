from django.db import models
from django.contrib.auth import get_user_model


class Room(models.Model):
    """Chat Room Model"""

    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class GroupRoom(Room):
    """Room for group chat"""

    zscore = models.FloatField(null=True)
    password = models.CharField(max_length=128, null=True)
    admin = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name="group_rooms",
        null=True,
    )
