from django.db import models
from django.contrib.auth import get_user_model


class Room(models.Model):
    """Chat Room Model"""

    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    player = models.OneToOneField("chat.Player", on_delete=models.SET_NULL, null=True)

    class Meta:
        abstract = True


class IndividualRoom(Room):
    """Room for individual chat"""

    id = models.CharField(max_length=36, primary_key=True)
    channel1 = models.OneToOneField(
        "chat.IndividualChannel", on_delete=models.CASCADE, related_name="room1"
    )
    channel2 = models.OneToOneField(
        "chat.IndividualChannel", on_delete=models.CASCADE, related_name="room2"
    )


class GroupRoom(Room):
    """Room for group chat"""

    avatar_url = models.URLField(blank=True)
    zscore = models.FloatField(null=True)
    password = models.CharField(max_length=128, blank=True)
    admins = models.ManyToManyField(
        get_user_model(),
        related_name="group_rooms",
    )

    @property
    def is_protected(self):
        """
        Returns a boolean value indicating if the room is password protected
        """
        return bool(self.password)
