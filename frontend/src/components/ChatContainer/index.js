import React from 'react';
import { Box, Container, Grid, makeStyles } from '@material-ui/core';
import { chatContainerStore } from 'stores';
import { observer } from 'mobx-react-lite';
import { ChatWindowStoreContext } from 'contexts';
import ChatWindow from './ChatWindow';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    right: '0',
    top: window.innerHeight - theme.spacing(2),
    width: 'auto',
    height: 'auto',
    transform: 'translateY(-100%)',
  },
  chatWindow: {
    marginLeft: theme.spacing(1),
  },
}));

const ChatContainer = () => {
  const classes = useStyles();

  const chatWindowsList = chatContainerStore.chatWindows.map((chatWindow, index) => (
    <Grid item key={chatWindow.id} className={classes.chatWindow}>
      <ChatWindowStoreContext.Provider value={chatWindow.store}>
        <ChatWindow chatId={chatWindow.id} />
      </ChatWindowStoreContext.Provider>
    </Grid>
  ));

  return (
    <Box className={classes.root}>
      <Container>
        <Grid container direction="row-reverse">
          {chatWindowsList}
        </Grid>
      </Container>
    </Box>
  );
};

export default observer(ChatContainer);
