import log from 'loglevel';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { alpha, Box, Button, CardMedia, Stack, useMediaQuery } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { appStore } from 'stores';
import { observer } from 'mobx-react-lite';
import { ChatWindowStoreContext } from 'contexts';
import PlayerBG from 'assets/images/player_bg.webp';
import ChatContainerBG from 'assets/images/chatcontainer_bg.webp';
import RouterLink from 'components/RouterLink';
import CenterPaper from 'components/CenterPaper';
import Notification from 'components/Notification';
import notFoundJson from 'assets/animations/not-found.json';
import { RoomType, OngoingChatRegex, ChatStatus } from 'appConstants';
import { fetchUrl } from 'utils';
import WaitScreen from 'components/WaitScreen';
import { getStoredChatWindowData, updateStoredChatWindowData } from 'utils/browserStorageUtils';
import { useSearchParams } from 'hooks';
import ChatWindow from './ChatWindow';
import Player from './Player';
import RoomPasswordDialog from './RoomPasswordDialog';

const useStyles = makeStyles((theme) => ({
  // @ts-ignore
  player: {
    position: 'relative',
    transition: theme.transitions.create('all', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
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
  chatWindowContainer: {
    position: 'relative',
    [theme.breakpoints.up('lg')]: {
      maxWidth: `${theme.breakpoints.values.lg}${theme.breakpoints.unit}`,
      margin: '0 auto',
    },
  },
  fullScreen: {
    [theme.breakpoints.down('sm')]: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
    },
  },
}));

function ChatContainer(props) {
  const { type: chatWindowType, location } = props;
  const { pathname } = location;
  const { chatWindow: chatWindowStore } = appStore;
  const [initializating, setInitializating] = useState(false);
  const [shouldOpenRoomPasswordDialog, setShouldOpenRoomPasswordDialog] = useState(false);
  const [searchParams] = useSearchParams();

  const startChat = (chatWindowData) => {
    appStore.addChatWindow(chatWindowData);
    setInitializating(false);
  };

  useEffect(() => {
    if (!chatWindowStore) {
      setInitializating(true);
    }
    let cleanup = () => {};
    if (chatWindowType === 'match') {
      cleanup = () => {
        if (chatWindowStore?.chatStatus === ChatStatus.NO_MATCH_FOUND) {
          /*
           * If match is not found we need to remove chat window,
           * otherwise it will be removed when room route unmounts
           */
          appStore.removeChatWindow();
        }
      };
    } else if (chatWindowType === 'room') {
      cleanup = () => appStore.removeChatWindow();
    }
    return cleanup;
  }, [chatWindowType, chatWindowStore]);

  useEffect(() => {
    if (initializating) {
      // ChatContainer initializes chatWindow in appStore with the stored data (overwrites old stale chatwindow).
      if (chatWindowType === 'room') {
        const ongoingChatMatch = pathname.match(OngoingChatRegex);
        const { roomType, roomId } = ongoingChatMatch.groups;
        if (Object.values(RoomType).includes(roomType)) {
          const isGroupRoom = roomType === RoomType.GROUP;
          const chatWindowData = {
            ...getStoredChatWindowData(roomType, roomId),
            roomId,
            isGroupRoom,
          };
          if (isGroupRoom && !chatWindowData.password) {
            fetchUrl(`/api/chat/rooms/${chatWindowData.roomId}/is_protected`)
              .then((response) => {
                const {
                  // @ts-ignore
                  data: { is_protected: isProtected, name, avatar_url: avatarUrl },
                } = response;
                if (isProtected) {
                  updateStoredChatWindowData(roomType, roomId, { name, avatarUrl });
                  setShouldOpenRoomPasswordDialog(true);
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
                setInitializating(false);
                appStore.removeChatWindow(); // Remove chat window, if any.
              });
          } else {
            startChat(chatWindowData);
          }
        }
      } else if (chatWindowType === 'match') {
        startChat();
      }
    }
  }, [initializating, chatWindowType, pathname]);
  // @ts-ignore
  const shouldOpenPlayer = searchParams.get('playerOpen') === 'true';
  const classes = useStyles();
  // @ts-ignore
  const isNotLargeScreen = useMediaQuery((thm) => thm.breakpoints.down('lg'));

  const render = () =>
    chatWindowStore ? (
      <ChatWindowStoreContext.Provider value={chatWindowStore}>
        {isNotLargeScreen ? (
          <>
            <Box className={classes.fullScreen}>
              <CardMedia className={classes.bg} image={PlayerBG} title="Player Background" />
              {shouldOpenPlayer && <Player />}
            </Box>
            <ChatWindow location={location} />
          </>
        ) : (
          <Stack sx={{ width: '100%', height: '100%', position: 'relative' }} direction="row">
            <CardMedia
              className={classes.bg}
              image={ChatContainerBG}
              title="ChatContainer Background"
            />
            <Box sx={{ flex: shouldOpenPlayer && { lg: 3, xs: 0 } }} className={classes.player}>
              <CardMedia className={classes.bg} image={PlayerBG} title="Player Background" />
              {shouldOpenPlayer && <Player />}
            </Box>
            <Box
              sx={{ flexGrow: 1, flexBasis: 0 }}
              className={classes.chatWindowContainer}
              id="chatWindow"
            >
              <ChatWindow location={location} />
            </Box>
          </Stack>
        )}
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

  return (
    <>
      {initializating ? <WaitScreen shouldOpen={initializating} /> : render()}
      <RoomPasswordDialog
        handleStartChat={startChat}
        shouldOpen={shouldOpenRoomPasswordDialog}
        setShouldOpen={setShouldOpenRoomPasswordDialog}
      />
    </>
  );
}

ChatContainer.propTypes = {
  type: PropTypes.string.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export default observer(ChatContainer);
