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
  fixedChatWindow: {
    [theme.breakpoints.down('lg')]: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: theme.spacing(40),
      zIndex: 1,
    },
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
    roomInfo: { roomId },
    previousMessagesInfo,
    roomType,
  } = chatWindowStore;
  const { fetchingPreviousMessages, previousMessagesCount } = previousMessagesInfo;
  const lastMessage = !messageList.length ? null : messageList[messageList.length - 1];

  const [shouldRenderFixed, setShouldRenderFixed] = useState(false);
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

  useEffect(() => {
    const handleResize = () => {
      const chatWindow = document.querySelector('#chatWindow');
      const availableChatWindowHeight = chatWindow.clientHeight;
      /*
       * There are cases when chat window height becomes very small and chat messages are barely/not visible.
       * One such case is when both player and virtual keyboard are simultaneously open on mobile devices.
       * To avoid such UX, we render fixed chat window when chat window height is less than 320px.
       * This ensures that chatWindow's height is always >= 320px so that sufficient number of messages are visible.
       */
      if (availableChatWindowHeight < parseInt(theme.spacing(40), 10)) {
        setShouldRenderFixed(true);
      } else {
        setShouldRenderFixed(false);
      }
    };
    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport.removeEventListener('resize', handleResize);
  }, [theme]);

  const { hasNewMessage, newMessageInfo } = useNewMessage({
    initialRenderingDone,
    lastMessage,
  });

  const shouldNotify = hasNewMessage && chatStatus === ChatStatus.ONGOING;
  useChatSound({ incomingMessageSound, chatStartedSound, shouldNotify, initDone });

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

  const overlayContent = {
    text: 'Disconnected',
  };
  if (!isGroupChat) {
    overlayContent.text =
      chatStatus === ChatStatus.NO_MATCH_FOUND
        ? 'Looks like no one is online'
        : `${chatWindowStore.name} left`;
    overlayContent.button = {
      text: 'Find match again',
      icon: <Replay />,
      action: () => history.replace('/chat/match/'),
    };
  }

  return shouldRedirect ? (
    <WaitScreen
      className={classes.backdrop}
      shouldOpen={shouldRedirect}
      waitScreenText="Redirecting"
    />
  ) : (
    <Stack
      justifyContent="space-between"
      className={clsx(classes.root, shouldRenderFixed && classes.fixedChatWindow)}
    >
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
              when={[ChatStatus.ONGOING, ChatStatus.RECONNECTING].includes(chatStatus)}
              dialogProps={{
                title: 'Do you want to close this chat?',
                description: 'This will terminate this chat session.',
              }}
              shouldBlockNavigation={(nextLocation) => pathname !== nextLocation.pathname}
            />

            <MessageBox
              firstItemIndex={previousMessagesCount ? previousMessagesCount - 1 : 0}
              hasNewMessage={hasNewMessage}
              newMessageInfo={newMessageInfo}
              chatMessages={chatMessages}
            />
          </Box>
        )}
        {(chatStatus === ChatStatus.NO_MATCH_FOUND || chatStatus === ChatStatus.ENDED) && (
          <Stack justifyContent="center" alignItems="center" className="overlay">
            <Box className={classes.infoMsgBox}>
              <Typography align="center" className={classes.regretMsg} variant="subtitle2">
                {overlayContent.text}
                <span className="emoji"> &#128542;</span>
              </Typography>
            </Box>
            {overlayContent.button && (
              <Box mt={1}>
                <Button
                  variant="contained"
                  endIcon={overlayContent.button.icon}
                  onClick={overlayContent.button.action}
                >
                  {overlayContent.button.text}
                </Button>
              </Box>
            )}
          </Stack>
        )}
      </Stack>
      <InputBar />
    </Stack>
  );
}

export default observer(ChatWindow);
