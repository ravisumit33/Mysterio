import React, { useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Backdrop, Box, CircularProgress, makeStyles, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { ChatStatus, MessageType } from 'constants.js';
import { ChatWindowStoreContext } from 'contexts';
import { profileStore } from 'stores';
import clsx from 'clsx';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import InputBar from './InputBar';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    boxShadow: '0px 7px 40px 2px rgba(148, 149, 150, 0.3)',
    backgroundColor: 'white',
    borderRadius: theme.spacing(1, 1, 0, 0),
    margin: '0 auto',
  },
  infoMsg: {
    fontWeight: 500,
    color: 'rgba(0,0,0,0.4)',
    margin: theme.spacing(1, 0),
    fontSize: '0.75rem',
    textAlign: 'center',
  },
  section: {
    padding: theme.spacing(0, 1),
  },
  header: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  // @ts-ignore
  messageBox: ({ chatStatus }) => ({
    position: 'relative',
    ...(chatStatus === ChatStatus.ENDED && { opacity: 0.3 }),
  }),
  backdrop: {
    position: 'absolute',
    zIndex: 1,
    color: '#fff',
  },
}));

const ChatWindow = (props) => {
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { messageList, isWindowMinimized, chatStatus } = chatWindowStore;
  const { chatId } = props;
  const classes = useStyles({ chatStatus });
  const endBox = useRef(null);
  const scrollToBottom = () => {
    endBox.current && endBox.current.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom);

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
      <Box className={clsx(classes.section, classes.header)}>
        <ChatHeader chatId={chatId} />
      </Box>
      <Box flexGrow={1} overflow="scroll" className={clsx(classes.section, classes.messageBox)}>
        <Backdrop className={classes.backdrop} open={chatStatus === ChatStatus.NOT_STARTED}>
          <Typography variant="body1">Searching</Typography>
          <Box ml={2}>
            <CircularProgress color="inherit" />
          </Box>
        </Backdrop>
        {chatMessages}
        {/* https://github.com/mui-org/material-ui/issues/17010 */}
        <div ref={endBox} />
      </Box>
      {chatStatus === ChatStatus.ENDED && (
        <Typography className={classes.infoMsg}>Click &#x21BA; above to find someone</Typography>
      )}
      <Box>
        <InputBar />
      </Box>
    </Box>
  ) : (
    <></>
  );
};

ChatWindow.propTypes = {
  chatId: PropTypes.number.isRequired,
};

export default observer(ChatWindow);
