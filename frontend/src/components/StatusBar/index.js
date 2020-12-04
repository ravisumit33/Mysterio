import React from 'react';
import { chatContainerStore } from 'stores';

import { Drawer, List, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { ChatWindowStoreContext } from 'contexts';
import ChatListItem from './ChatListItem';

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    // position: 'absolute',
    // right: 0,
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
        <ChatWindowStoreContext.Provider value={store}>
          <ChatListItem key={id} chatId={id} />
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
