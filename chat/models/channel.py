from django.db import models
from .chat_session import ChatSession


def delete_session(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """
    Receiver function to delete session after channel delete
    """
    ChatSession.objects.filter(pk=instance.chat_session_id).delete()


class Channel(models.Model):
    """Channel Model for individual chat"""

    name = models.CharField(max_length=100, unique=True)
    chat_session = models.OneToOneField(
        "chat.ChatSession", on_delete=models.CASCADE, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        models.signals.post_delete.connect(delete_session, sender=cls)

    class Meta:
        abstract = True


class IndividualChannel(Channel):
    """Channel for individual chat"""

    is_matched = models.BooleanField(default=False)

    class Meta:
        # TODO: Analyse performance for indexes
        indexes = [
            models.Index(
                fields=["is_matched", "created_at"],
                condition=models.Q(is_matched=False),
                name="individual_channel_index",
            )
        ]


class GroupChannel(Channel):
    """Channel for group chat"""

    group_room = models.ForeignKey(
        "chat.GroupRoom",
        on_delete=models.CASCADE,
        related_name="group_channels",
        related_query_name="group_channel",
    )
