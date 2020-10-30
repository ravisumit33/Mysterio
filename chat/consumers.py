import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.exceptions import DenyConnection
from django.db.utils import IntegrityError
import chat.models.channel as Channel
import chat.models.message as Message
from chat.constants import MESSAGE, PREFIX

class ChatConsumer(WebsocketConsumer):
    """Custom WebsocketConsumer for handling chat web socket requests
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.channel_id = None
        self.room_id = None
        self.is_group_consumer = False

    def connect(self):
        session = self.scope['session']
        if session.session_key is None:
            # for local development
            session.create()

        # room_id in URL comes only in group chat
        if 'room_id' in self.scope['url_route']['kwargs']:
            self.room_id = self.scope['url_route']['kwargs']['room_id']
            try:
                new_channel = Channel.GroupChannel.objects.create(
                    name=self.channel_name,
                    session_id = session.session_key,
                    group_room_id = self.room_id
                )
            except IntegrityError as excp:
                raise DenyConnection from excp
            async_to_sync(self.channel_layer.group_add)(
                PREFIX.GROUP_ROOM + str(self.room_id),
                self.channel_name
            )
            async_to_sync(self.channel_layer.group_send)(
                PREFIX.GROUP_ROOM + str(self.room_id),
                {
                    'type': 'group_msg_receive',
                    'payload': {
                        'type': MESSAGE.USER_JOINED,
                        'data': {}
                        # TODO: send user info who has joined
                    }
                }
            )
            self.is_group_consumer = True
        else:
            new_channel = Channel.IndividualChannel.objects.create(
                name=self.channel_name,
                session_id = session.session_key,
            )
            async_to_sync(self.channel_layer.group_add)(
                PREFIX.INDIVIDUAL_CHANNEL + str(new_channel.id),
                self.channel_name
            )
        self.channel_id = new_channel.id
        self.accept()

    def disconnect(self, code):
        if self.is_group_consumer:
            Channel.GroupChannel.objects.filter(pk=self.channel_id).delete()
        else:
            Channel.IndividualChannel.objects.filter(pk=self.channel_id).delete()
            async_to_sync(self.channel_layer.group_discard)(
                PREFIX.INDIVIDUAL_CHANNEL + str(self.channel_id),
                self.channel_name
            )
        if self.room_id is not None:
            group_prefix = PREFIX.GROUP_ROOM if self.is_group_consumer else PREFIX.INDIVIDUAL_ROOM
            async_to_sync(self.channel_layer.group_discard)(
                group_prefix + str(self.room_id),
                self.channel_name
            )
            async_to_sync(self.channel_layer.group_send)(
                group_prefix + str(self.room_id),
                {
                    'type': 'group_msg_receive',
                    'payload': {
                        'type': MESSAGE.USER_LEFT,
                        'data': {}
                    }
                    #TODO: send user info who has left
                }
            )

    def receive(self, text_data=None, bytes_data=None):
        payload_json = json.loads(text_data)
        message_type = payload_json['type']
        message_data = payload_json['data']
        if message_type == MESSAGE.TEXT:
            if self.room_id is None:
                self.close()
                return
            group_prefix = PREFIX.INDIVIDUAL_ROOM
            if self.is_group_consumer:
                Message.TextMessage.objects.create(
                    group_room_id=self.room_id,
                    sender_channel_id=self.channel_id,
                    text=message_data['text']
                )
                group_prefix = PREFIX.GROUP_ROOM
            async_to_sync(self.channel_layer.group_send)(
                group_prefix + str(self.room_id),
                {
                    'type': 'group_msg_receive',
                    'payload': {
                        'type': MESSAGE.TEXT,
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
        if 'room_id' in payload['data']:
            self.room_id = payload['data']['room_id']
        self.send(text_data=json.dumps(payload))
