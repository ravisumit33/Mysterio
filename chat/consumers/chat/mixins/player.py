from chat.models import Player


class PlayerMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.player_id = None

    def disconnect(self, code):
        if self.player_id:
            Player.objects.filter(pk=self.player_id).delete()
            self.player_id = None
        super().disconnect()
