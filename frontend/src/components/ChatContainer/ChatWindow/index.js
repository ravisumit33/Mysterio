import React, { useContext, useEffect, useState } from 'react';
import {
  alpha,
  Box,
  Button,
  LinearProgress,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { teal } from '@mui/material/colors';
import { ChatStatus, RoomType } from 'appConstants';
import { ChatWindowStoreContext } from 'contexts';
import WaitScreen from 'components/WaitScreen';
import RouteLeavingGuard from 'components/RouteLeavingGuard';
import {
  useChatSound,
  useNewMessage,
  useSearchParams,
  useFullScreenChatWindow,
  useStartChat,
  useChatRoomInfoStore,
  useChatInfoStore,
  useChatMessageStore,
} from 'hooks';
import { Replay } from '@mui/icons-material';
import ChatHeader from './ChatHeader';
import InputBar from './InputBar';
import MessageBox from './MessageBox';
import FloatingChatBubble from './FloatingChatBubble';

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
  infoMsgBox: {
    textAlign: 'center',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
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

function ChatWindow() {
  // @ts-ignore
  const { chatInfoStore } = useChatInfoStore();
  const { chatStatus, initDone } = chatInfoStore;
  // @ts-ignore
  const { chatRoomInfoStore } = useChatRoomInfoStore();
  const { roomId, roomType, name } = chatRoomInfoStore;
  // @ts-ignore
  const { messageList, previousMessagesInfo } = useChatMessageStore();
  const isGroupChat = roomType === RoomType.GROUP;

  const { fetchingPreviousMessages } = previousMessagesInfo;
  const lastMessage = !messageList.length ? null : messageList[messageList.length - 1];

  const classes = useStyles({ chatStatus });
  const startChat = useStartChat();

  useFullScreenChatWindow();

  const { hasNewMessage, newMessageInfo } = useNewMessage({
    initDone,
    lastMessage,
  });

  const shouldNotify = hasNewMessage && chatStatus === ChatStatus.ONGOING;
  useChatSound({ shouldNotify, initDone });

  const shouldDisplayLoadingMessage = isGroupChat && fetchingPreviousMessages;

  const overlayContent = {
    text: 'Disconnected',
  };
  if (!isGroupChat) {
    overlayContent.text =
      chatStatus === ChatStatus.NO_MATCH_FOUND ? 'Looks like no one is online' : `${name} left`;
    overlayContent.button = {
      text: 'Find match again',
      icon: <Replay />,
      action: () => startChat(),
    };
  }

  // @ts-ignore
  const isNotLargeScreen = useMediaQuery((thm) => thm.breakpoints.down('lg'));
  const [searchParams, setSearchParams] = useSearchParams();
  // @ts-ignore
  const chatMinimized = searchParams.get('chatMinimized') === 'true';
  const shouldShowChatBubble = isNotLargeScreen && chatMinimized;
  const ongoingChatUrl = `/chat/${roomType}/${roomId}/`;

  return (
    <>
      <FloatingChatBubble
        shouldShow={shouldShowChatBubble}
        onClick={() => {
          const newUrlSearchParams = new URLSearchParams(searchParams.toString());
          newUrlSearchParams.set('chatMinimized', 'false');
          // @ts-ignore
          setSearchParams(newUrlSearchParams);
        }}
        hasNewMessage={hasNewMessage}
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

              <MessageBox newMessageInfo={newMessageInfo} hasNewMessage={hasNewMessage} />
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

export default observer(ChatWindow);
