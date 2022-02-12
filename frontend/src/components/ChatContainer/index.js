import React from 'react';
import { Box, CardMedia, Grid, makeStyles, Typography, useMediaQuery } from '@material-ui/core';
import { appStore } from 'stores';
import { observer } from 'mobx-react-lite';
import { ChatWindowStoreContext } from 'contexts';
import PlayerBG from 'assets/images/player_bg.webp';
import ChatWindow from './ChatWindow';
import Player from './Player';

const useStyles = makeStyles((theme) => ({
  // @ts-ignore
  player: ({ shouldOpenPlayer }) => ({
    paddingTop: theme.spacing(1),
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
}));

function ChatContainer() {
  const { chatWindow } = appStore;
  const classes = useStyles({ shouldOpenPlayer: chatWindow && chatWindow.shouldOpenPlayer });
  // @ts-ignore
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

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
    <Grid container alignItems="center" direction="column">
      <Box my={3}>
        <Grid item>
          <Typography variant="h6" align="center">
            No chat session found
          </Typography>
        </Grid>
      </Box>
    </Grid>
  );
}

export default observer(ChatContainer);
