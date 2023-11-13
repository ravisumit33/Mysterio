from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db import models


class Message(models.Model):
    """Model for chat messages."""

    sent_at = models.DateTimeField(auto_now_add=True)
    message_type = models.IntegerField()

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    room = models.ForeignKey(
        "chat.Room",
        on_delete=models.CASCADE,
        related_name="messages",
        related_query_name="message",
    )
    sender_channel = models.ForeignKey(
        "chat.Channel",
        on_delete=models.SET_NULL,
        related_name="messages",
        related_query_name="message",
        null=True,
    )

    class Meta:
        unique_together = (
            "content_type",
            "object_id",
        )


class MessageMixin:
    """
    Mixin for reverse querying message relation
    https://stackoverflow.com/a/60343738/6842304
    """

    @property
    def message(self):
        """
        Get message object
        """
        return self.message_relation.first()


class TextData(MessageMixin, models.Model):
    """Model to store text messages"""

    text = models.CharField(max_length=65535)
    message_relation = GenericRelation(Message, related_query_name="textdata")
