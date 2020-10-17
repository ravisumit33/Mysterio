from django.db import models
from django.contrib.sessions.models import Session

class Channel(models.Model):
    """Channel Model for individual chat
    """
    channel_name = models.CharField(max_length=100)
    session = models.ForeignKey(Session, on_delete=models.CASCADE, null=False)

    class Meta:
        abstract = True

class IndividualChannel(Channel):
    """Channel for individual chat
    """
    is_matched = models.BooleanField(default=False)

class GroupChannel(IndividualChannel):
    """Channel for group chat
    """
    group_room = models.ForeignKey('chat.GroupRoom', on_delete=models.CASCADE, related_name='group_channels')
