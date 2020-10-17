from django.db import models

class Room(models.Model):
    """Chat Room Model
    """
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True

class IndividualRoom(Room):
    """Room for individual chat
    """
    channel1 = models.ForeignKey('chat.IndividualChannel', on_delete=models.CASCADE, related_name='rooms1')
    channel2 = models.ForeignKey('chat.IndividualChannel', on_delete=models.CASCADE, related_name='rooms2')

class GroupRoom(Room):
    """Room for group chat
    """
