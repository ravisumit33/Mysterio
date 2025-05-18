import React, { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChatManager } from 'managers';
import { ChatManagerContext } from 'contexts';
import { useChatRoomInfoStore, useChatMessageStore, useManagerContext, useConstant } from 'hooks';

export default function ChatManagerProvider({ children }) {
  // @ts-ignore
  const { chatRoomInfoStore } = useChatRoomInfoStore();
  // @ts-ignore
  const { chatMessageStore } = useChatMessageStore();

  const stores = useMemo(
    () => ({ chatRoomInfoStore, chatMessageStore }),
    [chatRoomInfoStore, chatMessageStore],
  );
  const actions = useMemo(() => ({}), []);
  const getChatManagerContext = useManagerContext({ stores, actions });

  const chatManager = useConstant(() => new ChatManager(getChatManagerContext));

  useEffect(() => () => chatManager.close(), [chatManager]);

  return <ChatManagerContext.Provider value={chatManager}>{children}</ChatManagerContext.Provider>;
}

ChatManagerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
