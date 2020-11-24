import React from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, IconButton } from '@material-ui/core';
import { Launcher } from 'react-chat-window';
import log from 'loglevel';
import { observer } from 'mobx-react-lite';
import ReplayIcon from '@material-ui/icons/Replay';
import './styles.css';

const ChatWindow = (props) => {
  const { store } = props;
  const { messageList, isWindowMinimized } = store;

  function onMessageWasSent(message) {
    log.warn(message);
    store.handleSocketSend(message.data.text);
  }

  function handleChatBubbleClick() {
    log.warn('handleChatBubbleClick');
    // store.handleEndChat();
    // handleClose(id);
    store.toggleWindowMinimized();
  }

  function handleReconnectChat() {
    store.handleReconnectChat();
  }

  const chatWindowControlButton = !isWindowMinimized ? (
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
        isOpen={!isWindowMinimized}
        showEmoji
        onMessageWasSent={onMessageWasSent}
        handleClick={handleChatBubbleClick}
      />
      {chatWindowControlButton}
    </Box>
  );
};

ChatWindow.propTypes = {
  store: PropTypes.shape({
    messageList: PropTypes.arrayOf(PropTypes.string),
    isWindowMinimized: PropTypes.bool,
    handleSocketSend: PropTypes.func,
    toggleWindowMinimized: PropTypes.func,
    handleReconnectChat: PropTypes.func,
  }).isRequired,
};

ChatWindow.defaultProps = {};

export default observer(ChatWindow);
