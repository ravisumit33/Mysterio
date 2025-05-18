import React, { useCallback, useReducer, useMemo } from 'react';
import PropTypes from 'prop-types';
import { chatInfoReducer, initialChatInfoState } from 'stores/reducers';
import { ChatInfoActions } from 'stores/actions';
import { ChatInfoContext } from 'contexts';
import ChatRoomInfoProvider from './room';

export default function ChatInfoProvider({ children }) {
  const [chatInfoStore, chatInfoDispatch] = useReducer(chatInfoReducer, initialChatInfoState);

  const updateChatStatus = useCallback((chatStatus) => {
    // @ts-ignore
    chatInfoDispatch({ type: ChatInfoActions.STATUS_UPDATED, payload: { chatStatus } });
  }, []);

  const markChatRoomInitialized = useCallback(() => {
    // @ts-ignore
    chatInfoDispatch({ type: ChatInfoActions.INITIALIZED });
  }, []);

  const value = useMemo(
    () => ({
      chatInfoStore,
      updateChatStatus,
      markChatRoomInitialized,
    }),
    [chatInfoStore, updateChatStatus, markChatRoomInitialized],
  );

  return (
    <ChatInfoContext.Provider value={value}>
      <ChatRoomInfoProvider>{children}</ChatRoomInfoProvider>
    </ChatInfoContext.Provider>
  );
}

ChatInfoProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
