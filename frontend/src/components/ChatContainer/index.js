import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
import { useQuery } from 'hooks';
import { RoomType } from 'appConstants';
import ChatWindow from './ChatWindow';
import Player from './Player';

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

function ChatContainer() {
  const { chatWindow } = appStore;
  const { pathname } = useLocation();
  const initialRenderinDoneRef = useRef(false);
  const urlSearchParams = useQuery();
  useEffect(() => {
    if (!initialRenderinDoneRef.current) {
      if (!chatWindow) {
        const randomSearchInProgressRegex = /^\/chat\/match\/?$/;
        const ongoingChatRegex = /^\/chat\/(?<roomType>\w+)\/(?<roomId>[0-9]+)(\/.*)?$/;
        const ongoingChatMatch = pathname.match(ongoingChatRegex);
        if (ongoingChatMatch) {
          const { roomId, roomType } = ongoingChatMatch.groups;
          if (Object.values(RoomType).includes(roomType)) {
            const isGroupRoom = roomType === RoomType.GROUP;
            const chatWindowData = {
              roomId,
              isGroupRoom,
              name: urlSearchParams.get('name') || '',
              avatarUrl: urlSearchParams.get('avatarUrl')
                ? decodeURIComponent(urlSearchParams.get('avatarUrl'))
                : '',
            };
            appStore.addChatWindow(chatWindowData);
          }
        } else if (pathname.match(randomSearchInProgressRegex)) {
          appStore.addChatWindow();
        }
      } else {
        // Redirect after match in dual chat
      }
      initialRenderinDoneRef.current = true;
    }
  }, [chatWindow, pathname, urlSearchParams]);
  const classes = useStyles({ shouldOpenPlayer: chatWindow && chatWindow.shouldOpenPlayer });
  // @ts-ignore
  const isNotLargeScreen = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  return chatWindow ? (
    <ChatWindowStoreContext.Provider value={chatWindow}>
      <Stack sx={{ width: '100%', height: '100%' }} direction={isNotLargeScreen ? 'column' : 'row'}>
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
}

export default observer(ChatContainer);
