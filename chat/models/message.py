from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Message(models.Model):
    """Model for chat messages."""

    group_room = models.ForeignKey(
        "chat.GroupRoom", on_delete=models.CASCADE, related_name="%(class)ss"
    )
    sender_channel = models.ForeignKey(
        "chat.GroupChannel",
        on_delete=models.SET_NULL,
        related_name="messages",
        related_query_name="message",
        null=True,
    )
    sent_at = models.DateTimeField(auto_now_add=True)
    message_type = models.IntegerField()

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")


class TextData(models.Model):
    """Model to store text messages"""

    text = models.CharField(max_length=65535)
