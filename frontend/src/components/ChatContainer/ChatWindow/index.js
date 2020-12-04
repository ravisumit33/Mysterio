import React, { useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, makeStyles, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import MessageType from 'constants.js';
import { ChatWindowStoreContext } from 'contexts';
import { profileStore } from 'stores';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import InputBar from './InputBar';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '375px',
    width: '350px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    boxShadow: '0px 7px 40px 2px rgba(148, 149, 150, 0.3)',
    backgroundColor: 'white',
  },
  infoMsg: {
    fontWeight: 500,
    color: 'rgba(0,0,0,0.4)',
    margin: '12px 0',
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    padding: theme.spacing(0, 1),
  },
}));

const ChatWindow = (props) => {
  const { chatId } = props;
  const classes = useStyles();
  const endBox = useRef(null);
  const scrollToBottom = () => endBox.current.scrollIntoView({ behavior: 'smooth' });
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { messageList, isWindowMinimized } = chatWindowStore;
  useEffect(scrollToBottom, [messageList]);

  const chatMessages = messageList.map((message, idx) => {
    const messageData = message.data;
    if (message.type === MessageType.TEXT) {
      const side = messageData.sender.id === profileStore.id ? 'right' : 'left';
      // eslint-disable-next-line react/no-array-index-key
      return <ChatMessage key={idx} side={side} messages={messageData.text} />;
    }
    return (
      // eslint-disable-next-line react/no-array-index-key
      <Typography key={idx} className={classes.infoMsg}>
        {messageData.text}
      </Typography>
    );
  });

  return !isWindowMinimized ? (
    <Box className={classes.root}>
      <Box className={classes.section}>
        <ChatHeader chatId={chatId} />
      </Box>
      <Box flexGrow={1} overflow="scroll" className={classes.section}>
        {chatMessages}
      </Box>
      <Box>
        <InputBar />
      </Box>
      <div ref={endBox} />
    </Box>
  ) : (
    <></>
  );
};

ChatWindow.propTypes = {
  chatId: PropTypes.number.isRequired,
};

export default observer(ChatWindow);
