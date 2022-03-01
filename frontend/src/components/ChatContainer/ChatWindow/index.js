import React, { useContext, useEffect, useRef } from 'react';
import { Box, Grid, LinearProgress, makeStyles, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { ChatStatus, MessageType } from 'appConstants';
import { ChatWindowStoreContext } from 'contexts';
import { profileStore } from 'stores';
import incomingMessageSound from 'assets/sounds/message_pop.mp3';
import chatStartedSound from 'assets/sounds/chat_started.mp3';
import WaitScreen from 'components/WaitScreen';
import { useChatSound, useConstant, useNewMessage } from 'hooks';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import InputBar from './InputBar';
import MessageBox from './MessageBox';

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
    padding: theme.spacing(1, 0),
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  section: {
    padding: theme.spacing(0, 1),
  },
  header: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
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

function ChatWindow(props) {
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { messageList, chatStatus, isGroupChat, initDone, appStore, previousMessagesInfo } =
    chatWindowStore;
  const { fetchingPreviousMessages, previousMessagesCount } = previousMessagesInfo;
  const lastMessage = !messageList.length ? null : messageList[messageList.length - 1];

  const classes = useStyles({ chatStatus });

  const initialRenderingDoneRef = useRef(false);
  useEffect(() => {
    if (initDone) {
      initialRenderingDoneRef.current = true;
    }
  }, [initDone]);

  const { hasNewMessage } = useNewMessage({
    initialRenderingDone: initialRenderingDoneRef.current,
    lastMessage,
  });

  const newMessageNotifyTypes = useConstant(() => [MessageType.TEXT]);
  const shouldNotify =
    hasNewMessage &&
    chatStatus === ChatStatus.ONGOING &&
    newMessageNotifyTypes.includes(lastMessage.type);
  useChatSound({ incomingMessageSound, chatStartedSound, shouldNotify, initDone });

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

  const chatMessages = messageList.map((message, idx, list) => {
    const messageData = message.data;
    const previousMessageData = idx ? list[idx - 1].data : null;
    const nextMessageData = idx + 1 === list.length ? null : list[idx + 1].data;
    const { sender } = messageData;
    const previousSender = previousMessageData && previousMessageData.sender;
    const nextSender = nextMessageData && nextMessageData.sender;
    if (message.type === MessageType.TEXT) {
      let side;
      let isFirst;
      let isLast;
      if (!sender) {
        side = 'left';
        isFirst = true;
        isLast = false;
      } else {
        side = sender.session_id === profileStore.sessionId ? 'right' : 'left';
        isFirst = !previousSender || sender.session_id !== previousSender.session_id;
        isLast = !isFirst && (!nextSender || sender.session_id !== nextSender.session_id);
      }
      return (
        // eslint-disable-next-line react/no-array-index-key
        <Box key={idx} className={classes.section}>
          <ChatMessage
            side={side}
            message={messageData.content}
            sender={messageData.sender}
            first={isFirst}
            last={isLast}
          />
        </Box>
      );
    }
    return (
      // eslint-disable-next-line react/no-array-index-key
      <Box key={idx} className={classes.section}>
        <Box className={classes.infoMsg}>{messageData.content}</Box>
      </Box>
    );
  });
  const shouldDisplayLoadingMessage = isGroupChat && fetchingPreviousMessages;

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
      <Grid item xs container direction="column" wrap="nowrap">
        <WaitScreen
          className={classes.backdrop}
          shouldOpen={
            chatStatus === ChatStatus.NOT_STARTED || chatStatus === ChatStatus.RECONNECT_REQUESTED
          }
          waitScreenText={isGroupChat ? 'Entering room' : 'Finding your match'}
        />
        {initDone && (
          <MessageBox
            firstItemIndex={previousMessagesCount ? previousMessagesCount - 1 : 0}
            hasNewMessage={hasNewMessage}
            chatMessages={chatMessages}
          />
        )}
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
