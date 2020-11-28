import React from 'react';
import Box from '@material-ui/core/Box';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import { chatContainerStore, profileStore } from 'stores';
import log from 'loglevel';

class Jumbotron extends React.Component {
  constructor(props) {
    super(props);
    this.handleStartChat = this.handleStartChat.bind(this);
    this.handleStartGroupChat = this.handleStartGroupChat.bind(this);
    this.handleSelectedRoomIdChange = this.handleSelectedRoomIdChange.bind(this);
    this.handleDialogueButtonClick = this.handleDialogueButtonClick.bind(this);
    this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
    this.openUserInfoDialog = this.openUserInfoDialog.bind(this);
    this.closeUserInfoDialog = this.closeUserInfoDialog.bind(this);
    this.state = {
      selectedRoomId: undefined,
      userInfoDialogOpen: false,
      textFieldValue: '',
    };
  }

  handleStartChat() {
    const { selectedRoomId } = this.state;
    log.warn(selectedRoomId);
    chatContainerStore.setIndividualChatExist(true);
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

  handleTextFieldChange(e) {
    this.setState({
      textFieldValue: e.target.value,
    });
  }

  handleDialogueButtonClick() {
    this.closeUserInfoDialog();
    const { selectedRoomId, textFieldValue } = this.state;
    profileStore.setName(textFieldValue);
    selectedRoomId ? this.handleStartGroupChat() : this.handleStartChat();
  }

  closeUserInfoDialog() {
    this.setState({
      userInfoDialogOpen: false,
    });
  }

  openUserInfoDialog() {
    this.setState({
      userInfoDialogOpen: true,
    });
  }

  render() {
    const { userInfoDialogOpen, textFieldValue } = this.state;
    return (
      <Box>
        Work in progress Jumbotron
        <Button
          disabled={chatContainerStore.individualChatExist}
          onClick={profileStore.name ? this.handleStartChat : this.openUserInfoDialog}
        >
          Start Chat
        </Button>
        <TextField
          placeholder="Enter Room Id"
          onChange={this.handleSelectedRoomIdChange}
          label="Room Id"
        />
        <Button onClick={profileStore.name ? this.handleStartGroupChat : this.openUserInfoDialog}>
          Start Group Chat
        </Button>
        <Dialog open={userInfoDialogOpen} onClose={this.closeUserInfoDialog}>
          <DialogTitle>Let&apos;s get started!</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              value={textFieldValue}
              onChange={this.handleTextFieldChange}
            />
          </DialogContent>
          <DialogActions>
            <Button
              disabled={!textFieldValue}
              onClick={this.handleDialogueButtonClick}
              color="primary"
            >
              Go
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
}

export default Jumbotron;
