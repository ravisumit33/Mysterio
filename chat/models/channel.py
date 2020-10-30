from django.db import models
from django.contrib.sessions.models import Session

class Channel(models.Model):
    """Channel Model for individual chat
    """
    name = models.CharField(max_length=100, unique=True)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        abstract = True

class IndividualChannel(Channel):
    """Channel for individual chat
    """
    is_matched = models.BooleanField(default=False)

class GroupChannel(Channel):
    """Channel for group chat
    """
    group_room = models.ForeignKey(
        'chat.GroupRoom',
        on_delete=models.CASCADE,
        related_name='group_channels'
    )
