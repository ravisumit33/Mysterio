from django.db import models


class Player(models.Model):
    """Model for player metadata"""

    NAME_CHOICES = (("YT", "YouTube"),)
    name = models.CharField(
        max_length=2,
        choices=NAME_CHOICES,
        default="YT",
    )
    video_id = models.SlugField()
    host = models.ForeignKey(
        "chat.ChatSession",
        on_delete=models.CASCADE,
        related_name="players",
        related_query_name="player",
    )
    STATE_CHOICES = (
        (-1, "unstarted"),
        (0, "ended"),
        (1, "playing"),
        (2, "paused"),
        (3, "buffering"),
    )
    state = models.SmallIntegerField(choices=STATE_CHOICES, default=-1)
    current_time = models.FloatField(default=0)
