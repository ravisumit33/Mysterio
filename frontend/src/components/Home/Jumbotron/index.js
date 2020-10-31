import React from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import Box from '@material-ui/core/Box';
import { Button, TextField } from '@material-ui/core';
import { Message } from 'constants.js';


class Jumbotron extends React.Component {
  constructor(props) {
    super(props);
    this.handleStartChat = this.handleStartChat.bind(this);
    this.handleEndChat = this.handleEndChat.bind(this);
    this.handleSocketSend = this.handleSocketSend.bind(this);
    this.handleCurrentMessageChange = this.handleCurrentMessageChange.bind(this);
    this.state = {
      chatSocket: null,
      currentMessage: '',
      localMessage: [],
    };
  }

  handleStartChat() {
    console.log('handleStartChat', 'chat start request sent');
    const SERVER_ADD = window.location.host.split(':')[0];
    console.log('handleStartChat', 'chat start request sent', SERVER_ADD);
    const socket = new ReconnectingWebSocket(`ws://${SERVER_ADD}:8000/ws/chat`);
    this.setState({
      chatSocket: socket,
    });
    socket.addEventListener('open', () => {
      console.log('socket connection established, try sending messages');
    });
    socket.addEventListener('close', () => {
      console.log('socket connection closed, try later');
    });
    
    socket.addEventListener('message', (event) => {
      console.log('socket connection received msg', event);
      const payload = JSON.parse(event.data);
      const message_type = payload.type;
      const message_data = payload.data;
      let message = '';
      switch (message_type) {
        case Message.USER_JOINED:
          message = 'User joined';
          break;
        case Message.USER_LEFT:
          this.handleEndChat();
          message = 'User left';
          break;
        case Message.TEXT:
          message = message_data.text;
          break;
        default:
          console.error('Unsupported message type', message_type);
          break;
      }
      const tempLocalMessage = [...this.state.localMessage, message];
      console.log('socket connection received msg', this.state.localMessage, tempLocalMessage);
      this.setState({
        localMessage: tempLocalMessage,
      });
    });
  }

  handleSocketSend() {
    console.log('chekc receive');
    const payload = {
      type: Message.TEXT,
      data: {
        text: this.state.currentMessage,
      },
    };
    this.state.chatSocket.send(JSON.stringify(payload));
    this.setState({
      currentMessage: '',
    });
  }

  handleCurrentMessageChange(event) {
    this.setState({
      currentMessage: event.target.value,
    });
  }

  handleEndChat() {
    this.state.chatSocket.close();
  }

  render() {
    const messageList = this.state.localMessage.map((message, index) => <div key={index}>{message}</div>);
    return (
      <Box>
        Work in progress Jumbotron
        <Button onClick={this.handleStartChat}>
          Start Chat
        </Button>
        {messageList}
        <TextField
          placeholder="Type your message"
          value={this.state.currentMessage}
          onChange={this.handleCurrentMessageChange}
          >    
        </TextField>
        <Button onClick={this.handleSocketSend}>
          Send Chat
        </Button>
        
        <Button onClick={this.handleEndChat}>
          End Chat
        </Button>
      </Box>
    );
  }
}

export default Jumbotron;
