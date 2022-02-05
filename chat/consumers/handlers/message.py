import logging
from django.db.utils import IntegrityError
import chat.models.message as Message
from chat.constants import MessageType
from chat.utils import channel_layer

logger = logging.getLogger(__name__)


def add_text_message(consumer, text, msg_type, fail_action=None):
    """
    Add entry to Text message model
    """
    try:
        Message.TextMessage.objects.create(
            group_room_id=consumer.room_id,
            sender_channel_id=consumer.channel_id,
            text=text,
            message_type=msg_type,
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
    if channel_layer_info["is_group_consumer"]:
        add_text_message(
            consumer,
            text=message_data["text"],
            msg_type=MessageType.TEXT,
            fail_action=lambda: channel_layer.group_send(
                channel_layer_info["group_prefix"] + str(consumer.room_id),
                MessageType.CHAT_DELETE,
                {"text": "Group is deleted"},
            ),
        )
    channel_layer.group_send(
        channel_layer_info["group_prefix"] + str(consumer.room_id),
        MessageType.TEXT,
        {
            "text": message_data["text"],
            "sender": consumer.profile,
        },
    )
    logger.info("Text message received")
    logger.debug("In room id: %s", str(consumer.room_id))
    logger.debug("By %s", consumer.profile["name"])
    logger.debug("%s", message_data["text"])
    # TODO: remove this log as messages will be encrypted
