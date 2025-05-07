import React, { useContext, useEffect, useState } from 'react';
import {
  alpha,
  Box,
  Button,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  Badge,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { teal } from '@mui/material/colors';
import { ChatStatus, MessageType } from 'appConstants';
import { ChatWindowStoreContext } from 'contexts';
import WaitScreen from 'components/WaitScreen';
import RouteLeavingGuard from 'components/RouteLeavingGuard';
import {
  useChatSound,
  useNewMessage,
  useChatBubble,
  useSearchParams,
  useProfileStore,
} from 'hooks';
import { useHistory } from 'react-router-dom';
import { Replay, ChatBubble } from '@mui/icons-material';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import PropTypes from 'prop-types';
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 1,
  },
  floatingChatBubble: {
    position: 'fixed',
    right: theme.spacing(2),
    bottom: theme.spacing(2),
    zIndex: 1000,
    '& .MuiBadge-badge': {
      right: -3,
      top: 13,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  },
  chatBubbleButton: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
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

function FloatingChatBubble({ unreadCount, onClick, shouldShow }) {
  const classes = useStyles();
  return (
    <Box className={classes.floatingChatBubble} sx={{ display: shouldShow ? 'block' : 'none' }}>
      <Button
        className={classes.chatBubbleButton}
        onClick={onClick}
        variant="contained"
        color="primary"
      >
        <Badge badgeContent={unreadCount} color="error">
          <ChatBubble />
        </Badge>
      </Button>
    </Box>
  );
}

FloatingChatBubble.propTypes = {
  unreadCount: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  shouldShow: PropTypes.bool,
};

FloatingChatBubble.defaultProps = {
  shouldShow: 'false',
};

function ChatWindow(props) {
  const {
    location: { pathname },
  } = props;
  // @ts-ignore
  const { profileStore } = useProfileStore();
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

  const classes = useStyles({ chatStatus });
  const history = useHistory();
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  // @ts-ignore
  const isNotLargeScreen = useMediaQuery((thm) => thm.breakpoints.down('lg'));
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
    const rootElement = document.querySelector('#root');
    /*
     * Fix root element to viewport so that chatWindow is removed from the document flow and fixed. It fixes issues such as unwanted scroll.
     * https://stackoverflow.com/a/68359419/6842304
     * We cannot use viewport units like dvh. It makes the chatWindow full screen but user can still scroll down since layout viewport is not resized.
     */
    // @ts-ignore
    rootElement.style.position = 'fixed';
    // @ts-ignore
    rootElement.style.inset = 0;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const originalMetaViewportContent = document
      .querySelector('meta[name=viewport]')
      .getAttribute('content');
    if (!isSafari) {
      /*
       * Resizes all viewports to avoid cases like scroll on soft keyboard
       * https://developer.chrome.com/blog/viewport-resize-behavior
       */
      document
        .querySelector('meta[name="viewport"]')
        .setAttribute(
          'content',
          `${originalMetaViewportContent}, interactive-widget=resizes-content`
        );
    }

    const scrollToTop = () => window.scrollTo(0, 0);
    const handleResize = () => {
      if (isSafari) {
        /*
         * Safari doesn't support interactive-widget
         * So, we need to manually resize root element and scroll to top but it still let user scroll down the chat window since layout viewport is not resized
         */
        // @ts-ignore
        rootElement.style.height = `${window.visualViewport.height}px`;
        scrollToTop();
      }
    };
    const handleTouchEnd = () => {
      if (isSafari) {
        /*
         * Since safari doesn't support interactive-widget, we need to manually scroll to top when the touch end
         */
        if (window.scrollY > 0) {
          scrollToTop();
        }
      }
    };
    const debouncedHandleTouchEnd = AwesomeDebouncePromise(handleTouchEnd, 50);
    window.addEventListener('touchend', debouncedHandleTouchEnd);
    window.visualViewport.addEventListener('resize', handleResize);
    return () => {
      window.visualViewport.removeEventListener('resize', handleResize);
      window.removeEventListener('touchend', debouncedHandleTouchEnd);
      // @ts-ignore
      rootElement.style.position = '';
      // @ts-ignore
      rootElement.style.inset = '';
      if (!isSafari) {
        document
          .querySelector('meta[name="viewport"]')
          .setAttribute('content', originalMetaViewportContent);
      } else {
        // @ts-ignore
        rootElement.style.height = '';
      }
    };
  }, [theme]);

  // @ts-ignore
  const chatMinimized = searchParams.get('chatMinimized') === 'true';
  const { hasNewMessage, newMessageInfo } = useNewMessage({
    initialRenderingDone,
    lastMessage,
  });
  const chatBubbleNewMsgCnt = useChatBubble({ chatMinimized, hasNewMessage });

  const shouldNotify = hasNewMessage && chatStatus === ChatStatus.ONGOING;
  useChatSound({ shouldNotify, initDone });

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

  const shouldShowChatBubble = isNotLargeScreen && chatMinimized;
  return shouldRedirect ? (
    <WaitScreen
      className={classes.backdrop}
      shouldOpen={shouldRedirect}
      waitScreenText="Redirecting"
    />
  ) : (
    <>
      <FloatingChatBubble
        shouldShow={shouldShowChatBubble}
        unreadCount={chatBubbleNewMsgCnt}
        onClick={() => {
          const newUrlSearchParams = new URLSearchParams(searchParams.toString());
          newUrlSearchParams.set('chatMinimized', 'false');
          // @ts-ignore
          setSearchParams(newUrlSearchParams);
        }}
      />

      <Stack
        justifyContent="space-between"
        className={clsx(classes.root, isNotLargeScreen && classes.fixedChatWindow)}
        sx={{ ...(shouldShowChatBubble && { display: 'none' }) }}
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
                shouldBlockNavigation={(nextLocation) => nextLocation.pathname !== ongoingChatUrl}
                shouldReplaceRoute
              />

              <MessageBox
                firstItemIndex={previousMessagesCount ? previousMessagesCount - 1 : 0}
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
    </>
  );
}

ChatWindow.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export default observer(ChatWindow);
