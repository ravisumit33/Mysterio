import React, { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChatManager } from 'managers';
import { ChatManagerContext } from 'contexts';
import {
  useChatRoomInfoStore,
  useChatMessageStore,
  useManagerContext,
  useConstant,
  useChatInfoStore,
} from 'hooks';

export default function ChatManagerProvider({ children }) {
  // @ts-ignore
  const { chatInfoStore, updateChatStatus, markChatRoomInitialized } = useChatInfoStore();
  // @ts-ignore
  const { chatRoomInfoStore, updateChatRoomData, updateBasicInfo } = useChatRoomInfoStore();
  // @ts-ignore
  const { chatMessageStore, addMessage } = useChatMessageStore();

  const stores = useMemo(
    () => ({ chatInfoStore, chatRoomInfoStore, chatMessageStore }),
    [chatInfoStore, chatRoomInfoStore, chatMessageStore],
  );
  const actions = useMemo(
    () => ({
      updateChatStatus,
      markChatRoomInitialized,
      updateChatRoomData,
      updateBasicInfo,
      addMessage,
    }),
    [updateChatStatus, markChatRoomInitialized, updateChatRoomData, updateBasicInfo, addMessage],
  );
  const getChatManagerContext = useManagerContext({ stores, actions });

  const chatManager = useConstant(() => new ChatManager(getChatManagerContext));

  useEffect(() => () => chatManager.close(), [chatManager]);

  return <ChatManagerContext.Provider value={chatManager}>{children}</ChatManagerContext.Provider>;
}

ChatManagerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
