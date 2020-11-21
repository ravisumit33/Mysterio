import React from 'react';
import { List, ListItem } from '@material-ui/core';
import { observer } from 'mobx-react';
import { chatContainerStore } from 'stores';

class ChatContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const chatContainerWindowsList = chatContainerStore.chatWindows.map((chatWindow) => (
      <ListItem button key={chatWindow}>
        {chatWindow}
      </ListItem>
    ));
    return <List component="div">{chatContainerWindowsList}</List>;
  }
}

export default observer(ChatContainer);
