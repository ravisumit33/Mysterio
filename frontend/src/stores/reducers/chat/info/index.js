import { ChatStatus } from 'appConstants';
import { ChatInfoActions } from 'stores/actions';

export const initialChatInfoState = {
  chatStatus: ChatStatus.NOT_STARTED,
  initDone: false, // Chat started and initialization(if required) is done
};

export const chatInfoReducer = (state, action) => {
  switch (action.type) {
    case ChatInfoActions.INITIALIZED:
      return {
        ...state,
        initDone: true,
      };
    case ChatInfoActions.STATUS_UPDATED:
      return {
        ...state,
        chatStatus: action.payload.chatStatus,
      };
    default:
      return state;
  }
};

export { initialChatRoomInfoState, chatRoomInfoReducer } from './room';
