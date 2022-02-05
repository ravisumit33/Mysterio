import React, { useContext, useEffect, useRef } from 'react';
import { Box, Grid, LinearProgress, makeStyles, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { ChatStatus, MessageType } from 'appConstants';
import { ChatWindowStoreContext } from 'contexts';
import { profileStore } from 'stores';
import clsx from 'clsx';
import incomingMessageSound from 'assets/sounds/message_pop.mp3';
import chatStartedSound from 'assets/sounds/chat_started.mp3';
import WaitScreen from 'components/WaitScreen';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import InputBar from './InputBar';

const useStyles = makeStyles((theme) => ({
  root: {
    boxSizing: 'border-box',
    boxShadow: '0px 7px 40px 2px rgba(148, 149, 150, 0.3)',
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.spacing(1, 1, 0, 0),
  },
  infoMsg: {
    fontWeight: 500,
    color: 'rgba(0,0,0,0.4)',
    margin: theme.spacing(1, 0),
    fontSize: '0.9rem',
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
    overflowY: 'scroll',
    ...((chatStatus === ChatStatus.ENDED || chatStatus === ChatStatus.NO_MATCH_FOUND) && {
      opacity: 0.5,
    }),
  }),
  backdrop: {
    position: 'absolute',
    zIndex: 1,
  },
  loadingMessageBackDrop: {
    display: 'flex',
    flexDirection: 'column',
    bottom: 'auto',
  },
  loadingMessage: {
    position: 'relative',
    height: theme.spacing(3.5),
  },
}));

const playIncomingMessageSound = () => {
  const audio = new Audio(incomingMessageSound);
  audio.play();
};

const playChatStartedSound = () => {
  const audio = new Audio(chatStartedSound);
  audio.play();
};

function ChatWindow(props) {
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { messageList, chatStatus, isGroupChat, initDone, appStore } = chatWindowStore;
  const classes = useStyles({ chatStatus });
  const endBox = useRef(null);
  const scrollToBottom = () => {
    endBox.current && endBox.current.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(
    () => () => {
      appStore.removeChatWindow();
      appStore.showAlert({
        text: `Chat sesssion ended.`,
        severity: 'success',
      });
    },
    [appStore]
  );
  useEffect(scrollToBottom);
  useEffect(() => {
    const lastMessage = messageList.length && messageList[messageList.length - 1];
    if (chatStatus === ChatStatus.ONGOING && lastMessage) {
      const isLastMessageText = lastMessage.type === MessageType.TEXT;
      if (isLastMessageText && lastMessage.data.sender.session_id !== profileStore.sessionId) {
        playIncomingMessageSound();
      }
    }
  });
  useEffect(() => initDone && playChatStartedSound(), [initDone]);

  const chatMessages = messageList.map((message, idx) => {
    const messageData = message.data;
    if (message.type === MessageType.TEXT) {
      const side = messageData.sender.session_id === profileStore.sessionId ? 'right' : 'left';
      return (
        // eslint-disable-next-line react/no-array-index-key
        <Grid item key={idx}>
          <ChatMessage side={side} messages={messageData.text} sender={messageData.sender} />
        </Grid>
      );
    }
    return (
      // eslint-disable-next-line react/no-array-index-key
      <Grid item key={idx}>
        <Typography className={classes.infoMsg}>{messageData.text}</Typography>
      </Grid>
    );
  });

  const shouldDisplayLoadingMessage =
    isGroupChat && !initDone && chatStatus !== ChatStatus.NOT_STARTED;

  return (
    <Grid
      item
      container
      direction="column"
      justifyContent="space-between"
      className={classes.root}
      xs
    >
      <Grid item className={clsx(classes.header, classes.section)}>
        <ChatHeader />
      </Grid>
      {shouldDisplayLoadingMessage && (
        <Box className={classes.loadingMessage}>
          <WaitScreen
            className={clsx(classes.backdrop, classes.loadingMessageBackDrop)}
            shouldOpen={shouldDisplayLoadingMessage}
            waitScreenText="Loading previous messages"
            progressComponent={<LinearProgress style={{ width: '100%' }} />}
          />
        </Box>
      )}
      <Grid
        item
        xs
        container
        direction="column"
        wrap="nowrap"
        className={clsx(classes.messageBox, classes.section)}
      >
        <WaitScreen
          className={classes.backdrop}
          shouldOpen={
            chatStatus === ChatStatus.NOT_STARTED || chatStatus === ChatStatus.RECONNECT_REQUESTED
          }
          waitScreenText={isGroupChat ? 'Entering room' : 'Finding your match'}
        />
        {chatMessages}
        {/* https://github.com/mui-org/material-ui/issues/17010 */}
        <div ref={endBox} />
      </Grid>
      {chatStatus === ChatStatus.NO_MATCH_FOUND && !isGroupChat && (
        <Typography className={classes.infoMsg}>Looks like no one is online &#128542;</Typography>
      )}
      {(chatStatus === ChatStatus.NO_MATCH_FOUND || chatStatus === ChatStatus.ENDED) &&
        !isGroupChat && (
          <Typography className={classes.infoMsg}>
            Click &#x21BA; above to reconnect to someone
          </Typography>
        )}
      <Grid item>
        <InputBar />
      </Grid>
    </Grid>
  );
}

export default observer(ChatWindow);
