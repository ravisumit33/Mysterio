import React from 'react';
import Box from '@material-ui/core/Box';
import { Button, TextField } from '@material-ui/core';
import { chatContainerStore } from 'stores';
import log from 'loglevel';

class Jumbotron extends React.Component {
  constructor(props) {
    super(props);
    this.handleStartChat = this.handleStartChat.bind(this);
    this.handleStartGroupChat = this.handleStartGroupChat.bind(this);
    this.handleSelectedRoomIdChange = this.handleSelectedRoomIdChange.bind(this);
    this.state = {
      selectedRoomId: undefined,
    };
  }

  handleStartChat() {
    const { selectedRoomId } = this.state;
    log.warn(selectedRoomId);
    chatContainerStore.addChatWindow();
  }

  handleStartGroupChat() {
    const { selectedRoomId } = this.state;
    chatContainerStore.addChatWindow(selectedRoomId);
  }

  handleSelectedRoomIdChange({ target: { value } }) {
    this.setState({
      selectedRoomId: parseInt(value, 10),
    });
  }

  render() {
    return (
      <Box>
        Work in progress Jumbotron
        <Button onClick={this.handleStartChat}>Start Chat</Button>
        <TextField
          placeholder="Enter Room Id"
          onChange={this.handleSelectedRoomIdChange}
          label="Room Id"
        />
        <Button onClick={this.handleStartGroupChat}>Start Group Chat</Button>
      </Box>
    );
  }
}

export default Jumbotron;
