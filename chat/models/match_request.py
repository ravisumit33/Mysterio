from django.db import models


class MatchRequest(models.Model):
    """Model for match requests"""

    is_matched = models.BooleanField(default=False)
    channel = models.OneToOneField("chat.Channel", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
