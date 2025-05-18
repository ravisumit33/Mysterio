import React from 'react';
import PropTypes from 'prop-types';
import ChatManagerProvider from './manager';
import ChatMessageProvider from './message';
import ChatInfoProvider from './info';

export default function ChatProvider({ children }) {
  return (
    <ChatInfoProvider>
      <ChatMessageProvider>
        <ChatManagerProvider>{children}</ChatManagerProvider>
      </ChatMessageProvider>
    </ChatInfoProvider>
  );
}

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
