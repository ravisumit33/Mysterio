import log from 'loglevel';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { alpha, Box, Button, CardMedia, Stack, useMediaQuery } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { appStore } from 'stores';
import { observer } from 'mobx-react-lite';
import { ChatWindowStoreContext } from 'contexts';
import PlayerBG from 'assets/images/player_bg.webp';
import RouterLink from 'components/RouterLink';
import CenterPaper from 'components/CenterPaper';
import Notification from 'components/Notification';
import notFoundJson from 'assets/animations/not-found.json';
import { useStoredChatWindowData } from 'hooks';
import { RoomType } from 'appConstants';
import { fetchUrl } from 'utils';
import WaitScreen from 'components/WaitScreen';
import ChatWindow from './ChatWindow';
import Player from './Player';
import RoomPasswordDialog from './RoomPasswordDialog';

const useStyles = makeStyles((theme) => ({
  // @ts-ignore
  player: ({ shouldOpenPlayer }) => ({
    position: 'relative',
    transition: theme.transitions.create('all', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.leavingScreen,
    }),
  }),
  bg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    backgroundColor: alpha(theme.palette.common.black, 0.1),
  },
  notFound: {
    marginBottom: theme.spacing(2),
  },
}));

const InitializationStatus = Object.freeze({
  INITIALIZING: 0,
  PASSWORD_DIALOG_OPEN: 1,
  INITIALIZED: 2,
});

function ChatContainer() {
  const { chatWindow } = appStore;
  const { pathname } = useLocation();
  const history = useHistory();
  const ongoingChatRegex = /^\/chat\/(?<roomType>\w+)\/(?<roomId>[0-9]+)(\/.*)?$/;
  const ongoingChatMatch = pathname.match(ongoingChatRegex);
  let roomId;
  let roomType;
  if (ongoingChatMatch) {
    ({ roomId, roomType } = ongoingChatMatch.groups);
  } else {
    roomType = '';
    roomId = '';
  }
  const [storedChatWindowData] = useStoredChatWindowData(roomType, roomId);
  const [initializationStatus, setInitializationStatus] = useState(
    InitializationStatus.INITIALIZING
  );
  const [shouldOpenRoomPasswordDialog, setShouldOpenRoomPasswordDialog] = useState(false);

  const startChat = (chatWindowData) => {
    appStore.addChatWindow(chatWindowData);
    // @ts-ignore
    setInitializationStatus(InitializationStatus.INITIALIZED);
  };

  useEffect(() => {
    const unlisten = history.listen((location) => {
      const { pathname: newPathname } = location;
      const isChatUrl = newPathname.match(/^\/chat\/.*$/);
      /*
       * If chat window is open and user navigates to a different chat route then reinitialize the chat window.
       * History change after random search is expected so no need to reinitialize.
       */
      const shouldReInitialize = isChatUrl && !pathname.match(/^\/chat\/match\/$/);
      if (shouldReInitialize && newPathname !== pathname) {
        setInitializationStatus(InitializationStatus.INITIALIZING);
      }
    });
    return () => unlisten();
  }, [history, pathname]);

  useEffect(() => {
    if (initializationStatus === InitializationStatus.INITIALIZING) {
      // ChatContainer initializes chatWindow in appStore with the data stored in localStorage (overwrites old stale chatwindow).
      if (ongoingChatMatch) {
        if (Object.values(RoomType).includes(roomType)) {
          const isGroupRoom = roomType === RoomType.GROUP;
          const chatWindowData = {
            ...storedChatWindowData,
            roomId,
            isGroupRoom,
          };
          if (isGroupRoom && !chatWindowData.password) {
            fetchUrl(`/api/chat/rooms/${chatWindowData.roomId}/is_protected`)
              .then((response) => {
                const {
                  // @ts-ignore
                  data: { is_protected: isProtected },
                } = response;
                if (isProtected) {
                  setShouldOpenRoomPasswordDialog(true);
                  // @ts-ignore
                  setInitializationStatus(InitializationStatus.PASSWORD_DIALOG_OPEN);
                } else {
                  startChat(chatWindowData);
                }
              })
              .catch((err) => {
                log.error(err);
                appStore.showAlert({
                  text: 'Error occured while connecting to server.',
                  severity: 'error',
                });
                // @ts-ignore
                setInitializationStatus(InitializationStatus.INITIALIZED);
                appStore.removeChatWindow(); // Remove chat window, if any.
              });
          } else {
            startChat(chatWindowData);
          }
        }
      } else {
        const randomSearchInProgressRegex = /^\/chat\/match\/?$/;
        const randomSearchInProgress = pathname.match(randomSearchInProgressRegex);
        if (randomSearchInProgress) {
          startChat();
        }
      }
    }
  }, [
    history,
    initializationStatus,
    ongoingChatMatch,
    pathname,
    roomId,
    roomType,
    storedChatWindowData,
  ]);
  const classes = useStyles({ shouldOpenPlayer: chatWindow && chatWindow.shouldOpenPlayer });
  // @ts-ignore
  const isNotLargeScreen = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const render = () =>
    chatWindow ? (
      <ChatWindowStoreContext.Provider value={chatWindow}>
        <Stack
          sx={{ width: '100%', height: '100%' }}
          direction={isNotLargeScreen ? 'column' : 'row'}
        >
          <Box
            sx={{ flex: chatWindow.shouldOpenPlayer && { lg: 3, xs: 0 } }}
            className={classes.player}
          >
            <CardMedia className={classes.bg} image={PlayerBG} title="Player Background" />
            {chatWindow.shouldOpenPlayer && <Player />}
          </Box>
          <Box sx={{ flexGrow: 1, flexBasis: 0 }}>
            <ChatWindow />
          </Box>
        </Stack>
      </ChatWindowStoreContext.Provider>
    ) : (
      <Box width="100%">
        <CenterPaper>
          <Stack justifyContent="space-around" spacing={2}>
            <Notification
              animationProps={{
                containerId: 'noChatSession',
                containerClassName: classes.notFound,
                animationData: notFoundJson,
                width: 40,
                height: 40,
              }}
              title="No active chat session!!"
              description="Probably your chat session ended. Go to home to start a new chat."
            />
            <RouterLink to="/" tabIndex={-1} style={{ alignSelf: 'center' }}>
              <Button color="secondary" variant="contained" size="large">
                Home
              </Button>
            </RouterLink>
          </Stack>
        </CenterPaper>
      </Box>
    );

  // @ts-ignore
  const shouldRender = initializationStatus === InitializationStatus.INITIALIZED;
  return (
    <>
      {!shouldRender ? <WaitScreen shouldOpen={!shouldRender} /> : render()}
      <RoomPasswordDialog
        handleStartChat={startChat}
        shouldOpen={shouldOpenRoomPasswordDialog}
        setShouldOpen={setShouldOpenRoomPasswordDialog}
      />
    </>
  );
}

export default observer(ChatContainer);
