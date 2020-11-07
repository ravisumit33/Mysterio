import React from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import Box from '@material-ui/core/Box';
import { Button, TextField } from '@material-ui/core';
import Message from 'constants.js';

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
      const messageType = payload.type;
      const messageData = payload.data;
      const message = { id: new Date().getTime() };
      switch (messageType) {
        case Message.USER_JOINED:
          message.text = 'User joined';
          break;
        case Message.USER_LEFT:
          this.handleEndChat();
          message.text = 'User left';
          break;
        case Message.TEXT:
          message.text = messageData.text;
          break;
        default:
          console.error('Unsupported message type', messageType);
          break;
      }
      const { localMessage } = this.state;
      const tempLocalMessage = [...localMessage, message];
      console.log('socket connection received msg', localMessage, tempLocalMessage);
      this.setState({
        localMessage: tempLocalMessage,
      });
    });
  }

  handleSocketSend() {
    console.log('chekc receive');
    const { currentMessage } = this.state;
    const payload = {
      type: Message.TEXT,
      data: {
        text: currentMessage,
      },
    };
    const { chatSocket } = this.state;
    chatSocket.send(JSON.stringify(payload));
    this.setState({
      currentMessage: '',
    });
  }

  handleCurrentMessageChange({ target: { value } }) {
    this.setState({
      currentMessage: value,
    });
  }

  handleEndChat() {
    const { chatSocket } = this.state;
    chatSocket.close();
  }

  render() {
    const { localMessage } = this.state;
    const messageList = localMessage.map((message) => <div key={message.id}>{message.text}</div>);
    const { currentMessage } = this.state;
    return (
      <Box>
        Work in progress Jumbotron
        <Button onClick={this.handleStartChat}>Start Chat</Button>
        {messageList}
        <TextField
          placeholder="Type your message"
          value={currentMessage}
          onChange={this.handleCurrentMessageChange}
        />
        <Button onClick={this.handleSocketSend}>Send Chat</Button>
        <Button onClick={this.handleEndChat}>End Chat</Button>
      </Box>
    );
  }
}

export default Jumbotron;
