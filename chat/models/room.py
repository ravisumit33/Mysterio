from django.contrib.auth import get_user_model
from django.db import models


class RoomType(models.TextChoices):
    """Room type choices"""

    GROUP = "gr", "Group"
    INDIVIDUAL = "in", "Individual"


class Room(models.Model):
    """Chat Room Model"""

    room_type = models.CharField(max_length=2, choices=RoomType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_group_room(self):
        """
        Returns a boolean value indicating if the room is group room
        """
        return self.room_type == RoomType.GROUP

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(room_type__in=[choice[0] for choice in RoomType.choices]),
                name="valid_room_type_choice",
            )
        ]


class GroupRoomData(models.Model):
    """Room data for group chat"""

    room = models.OneToOneField(
        "chat.Room",
        on_delete=models.CASCADE,
        related_name="room_data",
        related_query_name="room_data",
    )
    name = models.CharField(max_length=20)
    avatar_url = models.URLField(blank=True)
    zscore = models.FloatField(null=True)
    password = models.CharField(max_length=128, blank=True)
    description = models.CharField(max_length=256, blank=True)
    creator = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        related_name="group_rooms",
        related_query_name="group_room",
        null=True,
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
