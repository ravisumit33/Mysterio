from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password


class Room(models.Model):
    """Chat Room Model"""

    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class IndividualRoom(Room):
    """Room for individual chat"""

    channel1 = models.ForeignKey(
        "chat.IndividualChannel", on_delete=models.CASCADE, related_name="rooms1"
    )
    channel2 = models.ForeignKey(
        "chat.IndividualChannel", on_delete=models.CASCADE, related_name="rooms2"
    )


class GroupRoom(Room):
    """Room for group chat"""

    zscore = models.FloatField(null=True)
    is_protected = models.BooleanField(default=False)
    password = models.CharField(max_length=128, default=make_password(""))
    admin = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name="group_rooms",
        null=True,
    )
