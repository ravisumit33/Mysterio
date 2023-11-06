import logging

from django.db.utils import IntegrityError

from chat.constants import MessageType
from chat.models.message import (
    GroupRoomMessage,
    GroupRoomTextData,
    IndividualRoomMessage,
    IndividualRoomTextData,
)
from chat.utils import channel_layer

logger = logging.getLogger(__name__)


def add_text_message(consumer, text, msg_type, fail_action=None):
    """
    Add entry to textdata and message models
    """
    channel_layer_info = consumer.channel_layer_info
    is_group_consumer = channel_layer_info["is_group_consumer"]
    text_dala_cls = GroupRoomTextData if is_group_consumer else IndividualRoomTextData
    message_cls = GroupRoomMessage if is_group_consumer else IndividualRoomMessage

    try:
        text_data = text_dala_cls.objects.create(text=text)
        message_cls.objects.create(
            room_id=consumer.room_id,
            sender_channel_id=consumer.channel_id,
            message_type=msg_type,
            content_object=text_data,
        )
    except IntegrityError:
        if fail_action is not None:
            fail_action()
        return


def handle_text_message(consumer, message_data):
    """
    Text message handler for chat consumer
    """
    if consumer.room_id is None:
        logger.error("SuspiciousOperation : Text message received outside of room")
        consumer.close()
        return
    channel_layer_info = consumer.channel_layer_info
    add_text_message(
        consumer,
        text=message_data["text"],
        msg_type=MessageType.TEXT,
        fail_action=lambda: channel_layer.group_send(
            channel_layer_info["group_prefix"] + str(consumer.room_id),
            MessageType.CHAT_DELETE,
            {"text": "Room is deleted"},
        ),
    )
    channel_layer.group_send(
        channel_layer_info["group_prefix"] + str(consumer.room_id),
        MessageType.TEXT,
        {
            "content": message_data["text"],
            "sender": consumer.profile,
        },
    )
    logger.info("Text message received")
    logger.debug("In room id: %s", str(consumer.room_id))
    if "name" in consumer.profile:
        logger.debug("By %s", consumer.profile["name"])
    else:
        logger.error("Undefined sender for text message")
    logger.debug("%s", message_data["text"])
    # TODO: remove this log as messages will be encrypted
