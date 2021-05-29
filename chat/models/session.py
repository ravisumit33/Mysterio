from django.db import models


class ChatSession(models.Model):
    """
    Model for storing chat session
    """

    session_id = models.CharField(max_length=100)
    name = models.CharField(max_length=50)
    avatar_url = models.URLField()
