import { ChatRoomDataActions } from 'stores/actions';

export const initialChatRoomDataState = {
  adminAccess: false,
  isFavorite: false,
};

export const chatRoomDataReducer = (state, action) => {
  switch (action.type) {
    case ChatRoomDataActions.FAVORITE_STATUS_UPDATED:
      return {
        ...state,
        isFavorite: action.payload.isFavorite,
      };
    case ChatRoomDataActions.ADMIN_ACCESS_UPDATED:
      return {
        ...state,
        adminAccess: action.payload.adminAccess,
      };
    default:
      return state;
  }
};
