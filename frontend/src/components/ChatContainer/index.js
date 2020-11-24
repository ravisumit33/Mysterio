import React from 'react';
import { Box, Grid, makeStyles } from '@material-ui/core';
import { chatContainerStore } from 'stores';
import { observer } from 'mobx-react-lite';
import ChatWindow from './ChatWindow/index';

const useStyles = makeStyles(() => ({
  chatContainer: {
    position: 'absolute',
    right: '0',
    bottom: '0',
    width: 'auto',
    height: 'auto',
  },
}));

const ChatContainer = () => {
  const classes = useStyles();
  const chatContainerWindowsList = chatContainerStore.chatWindows.map((chatWindow, index) => (
    <Grid item key={chatWindow.id} style={{ marginLeft: 10 }}>
      <ChatWindow store={chatWindow.store} />
    </Grid>
  ));

  chatContainerWindowsList.reverse();
  return (
    <Box className={classes.chatContainer}>
      <Grid container alignItems="flex-end">
        {chatContainerWindowsList}
      </Grid>
    </Box>
  );
};

export default observer(ChatContainer);
