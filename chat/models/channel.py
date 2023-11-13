from django.db import models

from .chat_session import ChatSession


def delete_session(sender, instance, **kwargs):
    """
    Receiver function to delete session after channel delete
    """
    ChatSession.objects.filter(pk=instance.chat_session_id).delete()


class Channel(models.Model):
    """Channel Model for individual chat"""

    name = models.CharField(max_length=100, unique=True)
    chat_session = models.OneToOneField(
        "chat.ChatSession", on_delete=models.CASCADE, null=True, default=None, blank=True
    )
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

    @classmethod
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        models.signals.post_delete.connect(delete_session, sender=cls)
