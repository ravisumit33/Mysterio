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
    creator = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name="group_rooms",
        related_query_name="group_room",
    )
    admins = models.ManyToManyField(
        get_user_model(),
        related_name="accessible_group_rooms",
        related_query_name="accessible_group_room",
    )
    likers = models.ManyToManyField(
        get_user_model(),
        related_name="favorite_rooms",
        related_query_name="favorite_room",
    )

    @property
    def is_protected(self):
        """
        Returns a boolean value indicating if the room is password protected
        """
        return bool(self.password)
