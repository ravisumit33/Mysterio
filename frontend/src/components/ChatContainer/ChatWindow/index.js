import React, { useContext, useEffect, useState } from 'react';
import { alpha, Box, Grid, LinearProgress, makeStyles, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { ChatStatus, MessageType } from 'appConstants';
import { ChatWindowStoreContext } from 'contexts';
import { profileStore } from 'stores';
import incomingMessageSound from 'assets/sounds/message_pop.mp3';
import chatStartedSound from 'assets/sounds/chat_started.mp3';
import WaitScreen from 'components/WaitScreen';
import { useChatSound, useNewMessage } from 'hooks';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import InputBar from './InputBar';
import MessageBox from './MessageBox';

const useStyles = makeStyles((theme) => ({
  root: {
    boxSizing: 'border-box',
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.spacing(1, 1, 0, 0),
  },
  infoMsg: {
    padding: theme.spacing(1, 0),
  },
  section: {
    padding: theme.spacing(0, 1),
  },
  header: {
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  backdrop: {
    position: 'absolute',
    zIndex: 1,
  },
  loadingMessageBackDrop: {
    flexDirection: 'column',
    bottom: 'auto',
  },
  msgBoxContainer: {
    position: 'relative',
  },
}));

function ChatWindow(props) {
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { messageList, chatStatus, isGroupChat, initDone, appStore, previousMessagesInfo } =
    chatWindowStore;
  const { fetchingPreviousMessages, previousMessagesCount } = previousMessagesInfo;
  const lastMessage = !messageList.length ? null : messageList[messageList.length - 1];

  const classes = useStyles({ chatStatus });

  const [initialRenderingDone, setInitialRenderingDone] = useState(false);
  useEffect(() => {
    if (initDone) {
      setInitialRenderingDone(true);
    }
  }, [initDone]);

  const { hasNewMessage, newMessageInfo } = useNewMessage({
    initialRenderingDone,
    lastMessage,
  });

  const shouldNotify = hasNewMessage && chatStatus === ChatStatus.ONGOING;
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
        isLast = !nextSender || sender.session_id !== nextSender.session_id;
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
        <Typography
          align="center"
          variant="caption"
          component="p"
          color="textSecondary"
          className={classes.infoMsg}
        >
          {messageData.content}
        </Typography>
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
      <Grid item xs container direction="column" wrap="nowrap" className={classes.msgBoxContainer}>
        {shouldDisplayLoadingMessage && (
          <Box>
            <WaitScreen
              className={clsx(classes.backdrop, classes.loadingMessageBackDrop)}
              shouldOpen={shouldDisplayLoadingMessage}
              waitScreenText="Loading previous messages"
              progressComponent={<LinearProgress style={{ width: '100%' }} />}
            />
          </Box>
        )}
        <WaitScreen
          className={classes.backdrop}
          shouldOpen={chatStatus === ChatStatus.NOT_STARTED}
          waitScreenText={isGroupChat ? 'Entering room' : 'Finding your match'}
        />
        {initDone && (
          <MessageBox
            firstItemIndex={previousMessagesCount ? previousMessagesCount - 1 : 0}
            hasNewMessage={hasNewMessage}
            newMessageInfo={newMessageInfo}
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
