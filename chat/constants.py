# pylint: disable=C0103
from enum import IntEnum
from dataclasses import dataclass


class MESSAGE(IntEnum):
    """Message enum to be sent on client"""

    USER_JOINED = 1
    USER_LEFT = 2
    USER_INFO = 3
    TEXT = 4


@dataclass
class PREFIX:
    """Prefix used in making group names"""

    INDIVIDUAL_CHANNEL = "grp_IndividualChannel_"
    GROUP_ROOM = "grp_GroupRoom_"
    INDIVIDUAL_ROOM = "grp_IndividualRoom_"
