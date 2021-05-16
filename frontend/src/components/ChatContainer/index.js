import React from 'react';
import { Box, makeStyles } from '@material-ui/core';
import { chatContainerStore } from 'stores';
import { observer } from 'mobx-react-lite';
import { ChatWindowStoreContext } from 'contexts';
import ChatWindow from './ChatWindow';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    right: '0',
    width: '100%',
    bottom: '0',
    top: '64px',
  },
}));

const ChatContainer = () => {
  const classes = useStyles();

  const { chatWindow } = chatContainerStore;
  return (
    chatWindow && (
      <Box className={classes.root}>
        <ChatWindowStoreContext.Provider value={chatWindow.store}>
          <ChatWindow chatId={chatWindow.id} />
        </ChatWindowStoreContext.Provider>
      </Box>
    )
  );
};

export default observer(ChatContainer);
