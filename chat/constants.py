from enum import IntEnum

class Message(IntEnum):
    """Message enum to be sent on client
    """
    PARTNER_JOINED = 1
    PARTNER_LEFT = 2
    TEXT = 3
