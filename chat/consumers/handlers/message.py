import logging
from django.db.utils import IntegrityError
from chat.models import Message, TextData
from chat.constants import MessageType
from chat.utils import channel_layer

logger = logging.getLogger(__name__)


def add_text_message(consumer, text, msg_type, fail_action=None):
    """
    Add entry to Text message model
    """
    try:
        text_data = TextData.objects.create(text=text)
        Message.objects.create(
            group_room_id=consumer.room_id,
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
    if channel_layer_info["is_group_consumer"]:
        add_text_message(
            consumer,
            text=message_data["content"],
            msg_type=MessageType.TEXT,
            fail_action=lambda: channel_layer.group_send(
                channel_layer_info["group_prefix_room"] + str(consumer.room_id),
                MessageType.CHAT_DELETE,
                {"text": "Group is deleted"},
            ),
        )
    channel_layer.group_send(
        channel_layer_info["group_prefix_room"] + str(consumer.room_id),
        MessageType.TEXT,
        {
            "content": message_data["content"],
            "sender": consumer.profile,
        },
    )
    logger.info("Text message received")
    logger.debug("In room id: %s", str(consumer.room_id))
    if "name" in consumer.profile:
        logger.debug("By %s", consumer.profile["name"])
    else:
        logger.error("Undefined sender for text message")
    logger.debug("%s", message_data["content"])
    # TODO: remove this log as messages will be encrypted
