import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.contrib.sessions.models import Session
from django.core.exceptions import SuspiciousOperation
import chat.models.channel as Channel
from chat.constants import Message

class ChatConsumer(WebsocketConsumer):
    """Custom WebsocketConsumer for handling chat web socket requests
    """
    room_id = None

    def connect(self):
        session = self.scope['session']
        if session.session_key is None:
            # for local development
            session.create()
        session_instance = Session.objects.get(pk=session.session_key)

        # TODO: handle group chat instantiation
        new_channel = Channel.IndividualChannel(
            channel_name=self.channel_name,
            session=session_instance
        )
        new_channel.save()

        # TODO: create one member channle group for indivial chat only
        async_to_sync(self.channel_layer.group_add)(
            str(new_channel.id),
            self.channel_name
        )
        self.accept()

    def disconnect(self, code):
        # TODO: notify corrosponding matched user after disconnect
        # TODO: handle group chat deletetion
        channel_inst = Channel.IndividualChannel.objects.get(channel_name=self.channel_name)

        # TODO: delete one member channle group for indivial chat only
        async_to_sync(self.channel_layer.group_discard)(
            str(channel_inst.id),
            self.channel_name
        )
        channel_inst.delete()
        if self.room_id is not None:
            async_to_sync(self.channel_layer.group_discard)(
                self.room_id,
                self.channel_name
            )
            async_to_sync(self.channel_layer.group_send)(
                self.room_id,
                {
                    'type': 'group_msg_receive',
                    'payload': {
                        'type': Message.PARTNER_LEFT,
                        'data': {}
                    }
                }
            )

    def receive(self, text_data=None, bytes_data=None):
        payload_json = json.loads(text_data)
        message_type = payload_json['type']
        message_data = payload_json['data']
        if message_type == Message.TEXT:
            if self.room_id is None:
                raise SuspiciousOperation
            async_to_sync(self.channel_layer.group_send)(
                self.room_id,
                {
                    'type': 'group_msg_receive',
                    'payload': {
                        'type': Message.TEXT,
                        'data': {
                            'text': message_data['text'],
                            'room_id': self.room_id,
                        }
                        # TODO: send 'sender info' and remove room i
                    }
                }
            )

    def group_msg_receive(self, event):
        """Group message receiver
        """
        payload = event['payload']
        # TODO: remove room id in payload
        if 'room_id' in payload['data']:
            self.room_id = payload['data']['room_id']
        self.send(text_data=json.dumps(payload))
