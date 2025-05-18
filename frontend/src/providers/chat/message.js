import React, { useCallback, useReducer, useMemo } from 'react';
import { chatMessageReducer, initialChatMessageState, ChatMessageActions } from 'stores';
import PropTypes from 'prop-types';
import { ChatMessageContext } from 'contexts';

export default function ChatMessageProvider({ children }) {
  const [chatMessageStore, chatMessageDispatch] = useReducer(
    chatMessageReducer,
    initialChatMessageState,
  );

  const addMessage = useCallback(
    (message) =>
      // @ts-ignore
      chatMessageDispatch({ type: ChatMessageActions.MESSAGE_ADDED, payload: { message } }),
    [],
  );

  const addPreviousMessages = useCallback(
    (previousMessageList) =>
      // @ts-ignore
      chatMessageDispatch({
        type: ChatMessageActions.PREVIOUS_MESSAGES_ADDED,
        payload: { previousMessageList },
      }),
    [],
  );

  const value = useMemo(
    () => ({
      chatMessageStore,
      addMessage,
      addPreviousMessages,
    }),
    [chatMessageStore, addMessage, addPreviousMessages],
  );
  return <ChatMessageContext.Provider value={value}>{children}</ChatMessageContext.Provider>;
}

ChatMessageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
