import { ChatRoomInfoActions } from 'stores/actions';

export const initialChatRoomInfoState = {
  name: '',
  avatarUrl: '',
  roomId: '',
  // TODO: No need to store password. To do this only allow signed in users to enter protected rooms using backend tokens.
  // And add user access control on backend.
  password: '',
  roomType: '',
};

export const chatRoomInfoReducer = (state, action) => {
  switch (action.type) {
    case ChatRoomInfoActions.BASIC_INFO_UPDATED:
      return {
        ...state,
        name: action.payload.name,
        avatarUrl: action.payload.avatarUrl,
      };
    case ChatRoomInfoActions.ROOM_DATA_UPDATED: {
      const roomDataKeys = ['roomId', 'roomType', 'password'];
      const updatedRoomData = Object.fromEntries(
        Object.entries(action.payload).filter(([k]) => roomDataKeys.includes(k)),
      );
      return {
        ...state,
        ...updatedRoomData,
      };
    }
    default:
      return state;
  }
};
