from chat.constants import MessageType
from chat.utils import channel_layer


def handle_secret_key(consumer, message_data):
    """
    Accept secret key and pass it on to other user
    """
    channel_layer_info = consumer.channel_layer_info
    channel_layer.group_send(
        channel_layer_info["group_prefix_channel"] + str(message_data["receiverId"]),
        MessageType.SECRET_KEY,
        {
            "secretKey": message_data["secretKey"],
            "sender": consumer.profile,
        },
    )
