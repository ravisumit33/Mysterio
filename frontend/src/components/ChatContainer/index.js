import React from 'react';
import { Box, Grid, makeStyles, Typography } from '@material-ui/core';
import { appStore } from 'stores';
import { observer } from 'mobx-react-lite';
import { ChatWindowStoreContext } from 'contexts';
import ChatWindow from './ChatWindow';
import Youtube from './Youtube';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    top: theme.spacing(7),
    right: 0,
    bottom: 0,
    left: 0,
    '@media (min-width:0px) and (orientation: landscape)': {
      top: theme.spacing(6),
    },
    '@media (min-width:600px)': {
      top: theme.spacing(8),
    },
  },
}));
const ChatContainer = () => {
  const { chatWindow } = appStore;
  const classes = useStyles();
  return chatWindow ? (
    <Box className={classes.root}>
      <ChatWindowStoreContext.Provider value={chatWindow}>
        <ChatWindow />
        {chatWindow.isGroupChat && <Youtube />}
      </ChatWindowStoreContext.Provider>
    </Box>
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
};

export default observer(ChatContainer);
