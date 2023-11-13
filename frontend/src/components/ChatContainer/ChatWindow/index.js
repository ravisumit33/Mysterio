import React, { useContext, useEffect, useState } from 'react';
import { alpha, Box, LinearProgress, Stack, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { ChatStatus, MessageType } from 'appConstants';
import { ChatWindowStoreContext } from 'contexts';
import { profileStore } from 'stores';
import incomingMessageSound from 'assets/sounds/message_pop.mp3';
import chatStartedSound from 'assets/sounds/chat_started.mp3';
import WaitScreen from 'components/WaitScreen';
import RouteLeavingGuard from 'components/RouteLeavingGuard';
import { useChatSound, useNewMessage } from 'hooks';
import { useHistory, useLocation } from 'react-router-dom';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import InputBar from './InputBar';
import MessageBox from './MessageBox';

const useStyles = makeStyles((theme) => ({
  root: {
    boxSizing: 'border-box',
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.spacing(1, 1, 0, 0),
    width: '100%',
    height: '100%',
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
    flex: 1,
  },
}));

function ChatWindow(props) {
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const {
    name,
    avatarUrl,
    messageList,
    chatStatus,
    isGroupChat,
    initDone,
    appStore,
    roomInfo: { roomId },
    previousMessagesInfo,
    roomType,
  } = chatWindowStore;
  const { fetchingPreviousMessages, previousMessagesCount } = previousMessagesInfo;
  const lastMessage = !messageList.length ? null : messageList[messageList.length - 1];

  const classes = useStyles({ chatStatus });
  const { pathname, search } = useLocation();
  const history = useHistory();
  const ongoingChatUrl = `/chat/${roomType}/${roomId}/?name=${name}&avatarUrl=${encodeURIComponent(
    avatarUrl
  )}`;
  const shouldRedirect = initDone && pathname + search !== ongoingChatUrl;
  useEffect(() => {
    if (shouldRedirect) {
      history.replace(ongoingChatUrl);
    }
  }, [shouldRedirect, history, ongoingChatUrl]);

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
    },
    [appStore]
  );

  const chatMessages = messageList.map((message, idx, list) => {
    const messageData = message.data;
    if (message.type === MessageType.TEXT) {
      const previousMessageData = idx ? list[idx - 1].data : null;
      const nextMessageData = idx + 1 === list.length ? null : list[idx + 1].data;
      const { sender } = messageData;
      const previousSender = previousMessageData && previousMessageData.sender;
      const nextSender = nextMessageData && nextMessageData.sender;
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

  return shouldRedirect ? (
    <WaitScreen
      className={classes.backdrop}
      shouldOpen={shouldRedirect}
      waitScreenText="Redirecting"
    />
  ) : (
    <Stack justifyContent="space-between" className={classes.root}>
      <Box className={clsx(classes.header, classes.section)}>
        <ChatHeader />
      </Box>
      <Stack className={classes.msgBoxContainer}>
        {shouldDisplayLoadingMessage && (
          <WaitScreen
            className={clsx(classes.backdrop, classes.loadingMessageBackDrop)}
            shouldOpen={shouldDisplayLoadingMessage}
            waitScreenText="Loading previous messages"
            progressComponent={<LinearProgress sx={{ width: '100%' }} />}
          />
        )}
        <WaitScreen
          className={classes.backdrop}
          shouldOpen={chatStatus === ChatStatus.NOT_STARTED}
          waitScreenText={roomId ? 'Entering room' : 'Finding your match'}
        />
        {initDone && (
          <Box sx={{ flexGrow: 1, flexBasis: 0 }}>
            <RouteLeavingGuard
              dialogProps={{
                title: 'Do you want to close this chat?',
                description: 'This will terminate this chat session.',
              }}
            />

            <MessageBox
              firstItemIndex={previousMessagesCount ? previousMessagesCount - 1 : 0}
              hasNewMessage={hasNewMessage}
              newMessageInfo={newMessageInfo}
              chatMessages={chatMessages}
            />
          </Box>
        )}
      </Stack>
      {chatStatus === ChatStatus.NO_MATCH_FOUND && !isGroupChat && (
        <Typography align="center" className={classes.infoMsg}>
          Looks like no one is online &#128542;
        </Typography>
      )}
      {(chatStatus === ChatStatus.NO_MATCH_FOUND || chatStatus === ChatStatus.ENDED) &&
        !isGroupChat && (
          <Typography align="center" className={classes.infoMsg}>
            Click &#x21BA; above to reconnect to someone
          </Typography>
        )}
      <InputBar />
    </Stack>
  );
}

export default observer(ChatWindow);
