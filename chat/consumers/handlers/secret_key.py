import logging
from chat.constants import MessageType
from chat.models.channel import GroupChannel, IndividualChannel
from chat.utils import channel_layer

logger = logging.getLogger(__name__)


def handle_secret_key(consumer, message_data):
    """
    Handler for forwarding secret key to designated recepient
    """
    logger.info(message_data)
    channel_model = (
        GroupChannel
        if consumer.channel_layer_info["is_group_consumer"]
        else IndividualChannel
    )
    receiver_channel_id = channel_model.objects.get(
        chat_session_id=message_data["receiverId"]
    ).id
    channel_layer_info = consumer.channel_layer_info
    channel_layer.group_send(
        channel_layer_info["group_prefix_channel"] + str(receiver_channel_id),
        MessageType.SECRET_KEY,
        {
            "secretKey": message_data["secretKey"],
            "sender": consumer.profile,
        },
    )

    logger.debug("Secret key:")
    logger.debug(message_data["secretKey"])
    logger.debug("sent to %s", message_data["receiverId"])
