import React from 'react';
import { alpha, Box, Button, CardMedia, Grid, Stack, useMediaQuery } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { appStore } from 'stores';
import { observer } from 'mobx-react-lite';
import { ChatWindowStoreContext } from 'contexts';
import PlayerBG from 'assets/images/player_bg.webp';
import RouterLink from 'components/RouterLink';
import CenterPaper from 'components/CenterPaper';
import Notification from 'components/Notification';
import notFoundJson from 'assets/animations/not-found.json';
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
    ...(!shouldOpenPlayer && { flexBasis: 0 }),
    maxWidth: '100%', // Fix for https://mui.com/components/grid/#direction-column-column-reverse
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
  const classes = useStyles({ shouldOpenPlayer: chatWindow && chatWindow.shouldOpenPlayer });
  // @ts-ignore
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return chatWindow ? (
    <ChatWindowStoreContext.Provider value={chatWindow}>
      <Grid item container xs direction={isSmallScreen ? 'column' : 'row'}>
        <Grid item container md={9} xs={chatWindow.adminAccess ? 7 : 6} className={classes.player}>
          <CardMedia className={classes.bg} image={PlayerBG} title="Player Background" />
          {chatWindow.shouldOpenPlayer && <Player isSmallScreen={isSmallScreen} />}
        </Grid>
        <Grid item container xs>
          <ChatWindow />
        </Grid>
      </Grid>
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
