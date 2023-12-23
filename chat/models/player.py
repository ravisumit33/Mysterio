from django.db import models


class PlayerName(models.TextChoices):
    """Player name choices"""

    YOUTUBE = "YT", "YouTube"


class PlayerState(models.IntegerChoices):
    """Player state choices"""

    UNSTARTED = -1, "unstarted"
    ENDED = 0, "ended"
    PLAYING = 1, "playing"
    PAUSED = 2, "paused"
    BUFFERING = 3, "buffering"
    VIDEO_CUED = 5, "video cued"


class Player(models.Model):
    """Model for player metadata"""

    name = models.CharField(
        max_length=2,
        choices=PlayerName.choices,
        default=PlayerName.YOUTUBE,
    )
    video_id = models.SlugField()
    host = models.OneToOneField(
        "chat.ChatSession",
        on_delete=models.CASCADE,
        related_name="player",
        related_query_name="player",
    )
    state = models.SmallIntegerField(choices=PlayerState.choices, default=PlayerState.UNSTARTED)
    current_time = models.FloatField(default=0)
    room = models.OneToOneField(
        "chat.Room", on_delete=models.CASCADE, related_name="player", related_query_name="player"
    )

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(name__in=[choice[0] for choice in PlayerName.choices]),
                name="valid_name_choice",
            ),
            models.CheckConstraint(
                check=models.Q(state__in=[choice[0] for choice in PlayerState.choices]),
                name="valid_state_choice",
            ),
        ]
