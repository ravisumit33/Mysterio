from django.db import models


class Channel(models.Model):
    """Channel Model for chat representing a websocket connection"""

    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    room = models.ForeignKey(
        "chat.Room",
        on_delete=models.CASCADE,
        related_name="channels",
        related_query_name="channel",
        blank=True,
        null=True,
        default=None,
    )
