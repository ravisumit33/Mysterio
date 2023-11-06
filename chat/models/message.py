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

    class Meta:
        unique_together = (
            "content_type",
            "object_id",
        )
        abstract = True


class IndividualRoomMessage(Message):
    """Model for individual room messages"""

    room = models.ForeignKey(
        "chat.IndividualRoom",
        on_delete=models.CASCADE,
        related_name="messages",
        related_query_name="message",
    )
    sender_channel = models.ForeignKey(
        "chat.IndividualChannel",
        on_delete=models.SET_NULL,
        related_name="messages",
        related_query_name="message",
        null=True,
    )


class GroupRoomMessage(Message):
    """Model for group room messages"""

    room = models.ForeignKey(
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

    class Meta:
        abstract = True


class IndividualRoomTextData(TextData):
    """Model to store individual room text messages"""

    message_relation = GenericRelation(IndividualRoomMessage, related_query_name="textdata")


class GroupRoomTextData(TextData):
    """Model to store individual room text messages"""

    message_relation = GenericRelation(GroupRoomMessage, related_query_name="textdata")
