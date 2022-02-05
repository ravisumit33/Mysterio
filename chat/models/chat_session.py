from django.db import models


class ChatSession(models.Model):
    """
    Model for storing chat session
    """

    tab_session_id = models.CharField(max_length=100)
    name = models.CharField(max_length=50)
    avatar_url = models.URLField()
    session = models.ForeignKey(
        "sessions.Session",
        on_delete=models.SET_NULL,
        null=True,
        related_name="chat_sessions",
        related_query_name="chat_session",
    )
