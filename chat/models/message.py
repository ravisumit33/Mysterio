from enum import Enum

from django.db import models


class MessageType(models.IntegerChoices):
    """Message types"""

    USER_JOINED = 1, "User joined"
    USER_LEFT = 2, "User left"
    USER_INFO = 3, "User info"
    TEXT = 4, "Text"
    CHAT_DELETE = 5, "Chat delete"
    PLAYER_INFO = 6, "Player info"
    PLAYER_SYNC = 7, "Player sync"
    PLAYER_END = 8, "Player end"


class Message(models.Model):
    """Model for chat messages."""

    sent_at = models.DateTimeField(auto_now_add=True)
    message_type = models.IntegerField(choices=MessageType.choices)
    room = models.ForeignKey(
        "chat.Room",
        on_delete=models.CASCADE,
        related_name="messages",
        related_query_name="message",
    )
    sender = models.ForeignKey(
        "chat.ChatSession",
        on_delete=models.SET_NULL,
        related_name="messages",
        related_query_name="message",
        null=True,
    )


class MessageDataType(str, Enum):
    TEXT = "text"


class TextData:
    """Model to store text messages"""

    message = models.OneToOneField(
        "chat.Message",
        on_delete=models.CASCADE,
        related_name="message_data",
    )
    text = models.CharField(max_length=65535)

    @property
    def type(self):
        return MessageDataType.TEXT
