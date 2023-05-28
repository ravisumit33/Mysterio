/*
import React from 'react';
import { chatContainerStore } from 'stores';

import { Drawer, List } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { observer } from 'mobx-react-lite';
import { ChatWindowStoreContext } from 'contexts';
import ChatListItem from './ChatListItem';

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    width: 240,
  },
  chatList: {
    marginTop: 'auto',
  },
}));

const StatusBar = () => {
  const classes = useStyles();
  const chatList = chatContainerStore.chatWindows.map(
    ({ id, store }) =>
      store.isWindowMinimized && (
        <ChatWindowStoreContext.Provider key={id} value={store}>
          <ChatListItem chatId={id} />
        </ChatWindowStoreContext.Provider>
      )
  );
  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={chatContainerStore.isAnyWindowMinimized}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <List className={classes.chatList}>{chatList}</List>
    </Drawer>
  );
};

export default observer(StatusBar);
*/
