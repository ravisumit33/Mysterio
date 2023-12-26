import React, { useContext, useEffect, useState } from 'react';
import { alpha, Box, Button, LinearProgress, Stack, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { teal } from '@mui/material/colors';
import { ChatStatus, MessageType } from 'appConstants';
import { ChatWindowStoreContext } from 'contexts';
import { profileStore } from 'stores';
import incomingMessageSound from 'assets/sounds/message_pop.mp3';
import chatStartedSound from 'assets/sounds/chat_started.mp3';
import WaitScreen from 'components/WaitScreen';
import RouteLeavingGuard from 'components/RouteLeavingGuard';
import { useChatSound, useNewMessage } from 'hooks';
import { useHistory, useLocation } from 'react-router-dom';
import { Replay } from '@mui/icons-material';
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
  infoMsgBox: {
    textAlign: 'center',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  infoMsg: {
    padding: theme.spacing(1, 1),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.spacing(1.5),
  },
  regretMsg: {
    padding: theme.spacing(0, 1),
    backgroundColor: theme.palette.grey.A100,
    borderRadius: theme.spacing(0.5),
  },
  section: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  header: {
    backgroundColor: alpha(theme.palette.common.black, 0.04),
    boxShadow: '0px 5px 20px 0px rgba(0, 0, 0, 0.2)',
    zIndex: 1,
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
    backgroundColor: teal[100],
  },
}));

function ChatWindow(props) {
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const {
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
  const { pathname } = useLocation();
  const history = useHistory();
  const theme = useTheme();
  const ongoingChatUrl = `/chat/${roomType}/${roomId}/`;
  const shouldRedirect = initDone && pathname !== ongoingChatUrl;
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
      <Box key={idx} className={clsx(classes.section, classes.infoMsgBox)}>
        <Typography
          align="center"
          variant="caption"
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
          <Box sx={{ flexGrow: 1, flexBasis: theme.spacing(15) }}>
            {/* Setting flex-basis prevents message box to get completely hidden when keyboard and video player both are opened on some mobile devices */}
            <RouteLeavingGuard
              when={[ChatStatus.ONGOING, ChatStatus.RECONNECTING].includes(chatStatus)}
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
        {(chatStatus === ChatStatus.NO_MATCH_FOUND || chatStatus === ChatStatus.ENDED) &&
          !isGroupChat && (
            <Stack justifyContent="center" alignItems="center" className="overlay">
              <Box className={classes.infoMsgBox}>
                <Typography align="center" className={classes.regretMsg} variant="subtitle2">
                  {chatStatus === ChatStatus.NO_MATCH_FOUND
                    ? `Looks like no one is online`
                    : `${chatWindowStore.name} left`}
                  <span className="emoji"> &#128542;</span>
                </Typography>
              </Box>
              <Box mt={1}>
                <Button
                  variant="contained"
                  endIcon={<Replay />}
                  onClick={() => history.replace('/chat/match/')}
                >
                  Find match again
                </Button>
              </Box>
            </Stack>
          )}
      </Stack>
      <InputBar />
    </Stack>
  );
}

export default observer(ChatWindow);
