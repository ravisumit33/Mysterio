import React from 'react';
import { chatContainerStore } from 'stores';

import { Drawer, List, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import ChatListItem from './chatListItem';

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
  const chatList = chatContainerStore.chatWindows.map(({ id, store }) => {
    return store.isWindowMinimized && <ChatListItem key={id} chatId={id} chatWindowStore={store} />;
  });
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
