import logging

from chat.constants import MessageType
from chat.consumers.utils import create_instance
from chat.serializers import WriteMessageSerializer
from chat.utils import channel_layer

logger = logging.getLogger(__name__)


def add_text_message(consumer, text, msg_type, fail_action=None):
    """
    Add entry to textdata and message models
    """
    try:
        create_instance(
            WriteMessageSerializer,
            {
                "content": {"text": text},
                "room": consumer.room_id,
                "sender_channel": consumer.channel_id,
                "message_type": msg_type,
            },
        )
    except Exception as excp:
        logger.error("Failed to add text message")
        logger.exception(excp)
        if fail_action is not None:
            fail_action()
        else:
            raise excp


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
