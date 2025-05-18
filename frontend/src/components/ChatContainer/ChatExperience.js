import React from 'react';
import { useSearchParams } from 'hooks';
import { alpha, useMediaQuery, CardMedia, Box, Stack } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PlayerBG from 'assets/images/player_bg.webp';
import ChatExperienceBG from 'assets/images/chatexperience_bg.webp';
import ChatWindow from './ChatWindow';
import Player from './Player';

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

function ChatExperience() {
  const [searchParams] = useSearchParams();
  // @ts-ignore
  const shouldOpenPlayer = searchParams.get('playerOpen') === 'true';
  // @ts-ignore
  const isNotLargeScreen = useMediaQuery((thm) => thm.breakpoints.down('lg'));
  const classes = useStyles();
  return isNotLargeScreen ? (
    <>
      <Box className={classes.fullScreen}>
        <CardMedia className={classes.bg} image={PlayerBG} title="Player Background" />
        {shouldOpenPlayer && <Player />}
      </Box>
      <ChatWindow />
    </>
  ) : (
    <Stack sx={{ width: '100%', height: '100%', position: 'relative' }} direction="row">
      <CardMedia className={classes.bg} image={ChatExperienceBG} title="ChatContainer Background" />
      <Box sx={{ flex: shouldOpenPlayer && { lg: 3, xs: 0 } }} className={classes.player}>
        <CardMedia className={classes.bg} image={PlayerBG} title="Player Background" />
        {shouldOpenPlayer && <Player />}
      </Box>
      <Box
        sx={{ flexGrow: 1, flexBasis: 0 }}
        className={classes.chatWindowContainer}
        id="chatWindow"
      >
        <ChatWindow />
      </Box>
    </Stack>
  );
}

export default ChatExperience;
