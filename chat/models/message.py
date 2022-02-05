from django.db import models


class Message(models.Model):
    """Base message model for chat messages."""

    group_room = models.ForeignKey(
        "chat.GroupRoom", on_delete=models.CASCADE, related_name="%(class)ss"
    )
    sender_channel = models.ForeignKey(
        "chat.GroupChannel",
        on_delete=models.SET_NULL,
        related_name="%(class)ss",
        related_query_name="%(class)s",
        null=True,
    )
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class TextMessage(Message):
    """Model to store text messages"""

    text = models.CharField(max_length=65535)
    message_type = models.IntegerField()
