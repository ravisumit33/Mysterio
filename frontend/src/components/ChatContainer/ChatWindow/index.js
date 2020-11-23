import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, IconButton } from '@material-ui/core';
import { Launcher } from 'react-chat-window';
import log from 'loglevel';
import { observer } from 'mobx-react-lite';
import ReplayIcon from '@material-ui/icons/Replay';
import { ChatWindowStore } from 'stores';
import './styles.css';

const ChatWindow = (props) => {
  const { roomId } = props;
  const [chatWindowStore, ,] = useState(new ChatWindowStore(roomId));
  const { messageList, isWidnowMinimized } = chatWindowStore;

  function onMessageWasSent(message) {
    log.warn(message);
    chatWindowStore.handleSocketSend(message.data.text);
  }

  function handleChatBubbleClick() {
    log.warn('handleChatBubbleClick');
    // chatWindowStore.handleEndChat();
    // handleClose(id);
    chatWindowStore.toggleWindowMinimized();
  }

  function handleReconnectChat() {
    chatWindowStore.handleReconnectChat();
  }

  const chatWindowControlButton = !isWidnowMinimized ? (
    <Grid container justify="flex-end">
      <IconButton
        style={{ marginRight: '4.2rem', marginTop: '1.5rem' }}
        onClick={handleReconnectChat}
      >
        <ReplayIcon />
      </IconButton>
    </Grid>
  ) : (
    <></>
  );

  return (
    <Box position="relative" height="500px" width="400px">
      <Launcher
        agentProfile={{
          teamName: 'Chat',
          imageUrl: 'https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png',
        }}
        messageList={messageList}
        isOpen={!isWidnowMinimized}
        showEmoji
        onMessageWasSent={onMessageWasSent}
        handleClick={handleChatBubbleClick}
      />
      {chatWindowControlButton}
    </Box>
  );
};

ChatWindow.propTypes = {
  roomId: PropTypes.number,
};

ChatWindow.defaultProps = {
  roomId: undefined,
};

export default observer(ChatWindow);
