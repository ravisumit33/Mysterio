import React from 'react';
import { Box, makeStyles } from '@material-ui/core';
import { appStore } from 'stores';
import { observer } from 'mobx-react-lite';
import { ChatWindowStoreContext } from 'contexts';
import ChatWindow from './ChatWindow';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    right: '0',
    width: '100%',
    bottom: '0',
    top: theme.spacing(8),
    zIndex: 2,
  },
}));

const ChatContainer = () => {
  const classes = useStyles();

  const { chatWindow } = appStore;
  return (
    chatWindow && (
      <Box className={classes.root}>
        <ChatWindowStoreContext.Provider value={chatWindow}>
          <ChatWindow />
        </ChatWindowStoreContext.Provider>
      </Box>
    )
  );
};

export default observer(ChatContainer);
