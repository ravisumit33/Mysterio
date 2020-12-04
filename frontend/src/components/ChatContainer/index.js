import React from 'react';
import { Box, Grid, makeStyles } from '@material-ui/core';
import { chatContainerStore } from 'stores';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { ChatWindowStoreContext } from 'contexts';
import ChatWindow from './ChatWindow';

const useStyles = makeStyles(() => ({
  chatContainer: {
    position: 'absolute',
    right: '0',
    bottom: '0',
    width: 'auto',
    height: 'auto',
  },
  chatMinimized: {
    right: 240,
  },
}));

const ChatContainer = () => {
  const classes = useStyles();

  const chatContainerWindowsList = chatContainerStore.chatWindows.map((chatWindow, index) => (
    <Grid item key={chatWindow.id} style={{ marginLeft: 10 }}>
      <ChatWindowStoreContext.Provider value={chatWindow.store}>
        <ChatWindow chatId={chatWindow.id} />
      </ChatWindowStoreContext.Provider>
    </Grid>
  ));

  chatContainerWindowsList.reverse();
  return (
    <Box className={clsx(classes.chatContainer, classes.chatMinimized)}>
      <Grid container alignItems="flex-end">
        {chatContainerWindowsList}
      </Grid>
    </Box>
  );
};

export default observer(ChatContainer);
