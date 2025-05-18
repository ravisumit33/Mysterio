import { ChatMessageActions } from 'stores/actions';

export const initialChatMessageState = {
  messageList: [],
};

export const chatMessageReducer = (state, action) => {
  switch (action.type) {
    case ChatMessageActions.MESSAGE_ADDED:
      return {
        ...state,
        messageList: [...state.messageList, action.payload.message],
      };
    case ChatMessageActions.PREVIOUS_MESSAGES_ADDED:
      return {
        ...state,
        messageList: action.payload.previousMessageList.concat(state.messageList),
      };
    default:
      return state;
  }
};
