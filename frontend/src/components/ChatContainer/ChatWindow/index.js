import React from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton } from '@material-ui/core';
import { Launcher } from 'react-chat-window';
import log from 'loglevel';
import { observer } from 'mobx-react-lite';
import ReplayIcon from '@material-ui/icons/Replay';
import MessageType from 'constants.js';
import MinimizeIcon from '@material-ui/icons/Minimize';
import './styles.css';

const ChatWindow = (props) => {
  const { chatWindowStore } = props;
  const {
    messageList,
    isWindowMinimized,
    name,
    socket,
    setWindowMinimized,
    reconnect,
  } = chatWindowStore;

  function onMessageWasSent(messageObj) {
    log.warn(messageObj);
    const message = messageObj.data;
    socket.send(MessageType.TEXT, message);
  }

  function handleMinimize() {
    // store.handleEndChat();
    // handleClose(id);
    setWindowMinimized(true);
  }

  function handleReconnect() {
    reconnect();
  }

  const chatWindowControlButton = (
    <>
      <IconButton style={{ marginRight: '4.2rem', marginTop: '1.5rem' }} onClick={handleReconnect}>
        <ReplayIcon />
      </IconButton>
      <IconButton style={{ marginRight: '4.2rem', marginTop: '1.5rem' }} onClick={handleMinimize}>
        <MinimizeIcon />
      </IconButton>
    </>
  );

  return !isWindowMinimized ? (
    <Box position="relative" height="500px" width="400px">
      <Launcher
        agentProfile={{
          teamName: name,
          imageUrl: 'https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png',
        }}
        messageList={messageList}
        isOpen={!isWindowMinimized}
        showEmoji
        onMessageWasSent={onMessageWasSent}
      />
      {chatWindowControlButton}
    </Box>
  ) : (
    <></>
  );
};

ChatWindow.propTypes = {
  chatWindowStore: PropTypes.shape({
    messageList: PropTypes.arrayOf(PropTypes.shape({})),
    isWindowMinimized: PropTypes.bool,
    name: PropTypes.string,
    socket: PropTypes.shape({
      send: PropTypes.func.isRequired,
    }).isRequired,
    setWindowMinimized: PropTypes.func.isRequired,
    reconnect: PropTypes.func.isRequired,
  }).isRequired,
};

export default observer(ChatWindow);
