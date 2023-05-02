from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db import models


class Message(models.Model):
    """Model for chat messages."""

    group_room = models.ForeignKey(
        "chat.GroupRoom",
        on_delete=models.CASCADE,
        related_name="messages",
        related_query_name="message",
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

    class Meta:
        unique_together = (
            "content_type",
            "object_id",
        )


class ContentData(models.Model):
    """
    Mixin for reverse querying message relation
    https://stackoverflow.com/a/60343738/6842304
    """

    message_relation = GenericRelation(Message, related_query_name="%(class)s")

    @property
    def message(self):
        """
        Get message object
        """
        return self.message_relation.first()

    class Meta:
        abstract = True


class TextData(ContentData):
    """Model to store text messages"""

    text = models.CharField(max_length=65535)
