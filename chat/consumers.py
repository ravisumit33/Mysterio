import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.sessions.models import Session
from django.core.exceptions import SuspiciousOperation
import chat.models.channel as Channel

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
        new_channel = Channel.IndividualChannel(channel_name=self.channel_name, session=session_instance)
        new_channel.save()

        # TODO: create one member channle group for indivial chat only
        async_to_sync(self.channel_layer.group_add)(
            str(new_channel.id),
            self.channel_name
        )
        self.accept()

    def disconnect(self, code):
        print('disconnect called')
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
        print('disconnect called ended')

    def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        text_msg = text_data_json['message']
        if self.room_id is None:
            raise SuspiciousOperation
        async_to_sync(self.channel_layer.group_send)(
            self.room_id,
            {
                'type': 'group_msg_receive',
                'payload': {
                    'message': text_msg,
                    'room_id': self.room_id,
                    # TODO: send 'sender info'
                }
            }
        )

    def group_msg_receive(self, event):
        """Group message receiver
        """
        payload = event['payload']
        text_msg = payload['message']
        if 'room_id' in payload:
            self.room_id = payload['room_id']
        self.send(text_data=json.dumps(
            {
                'message': text_msg,
                'room_id': self.room_id,
            }
        ))
