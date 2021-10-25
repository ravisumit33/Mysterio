import React from 'react';
import { Box, Grid, Typography } from '@material-ui/core';
import { appStore } from 'stores';
import { observer } from 'mobx-react-lite';
import { ChatWindowStoreContext } from 'contexts';
import ChatWindow from './ChatWindow';
import Youtube from './Youtube';

const ChatContainer = () => {
  const { chatWindow } = appStore;
  return chatWindow ? (
    <Box>
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
