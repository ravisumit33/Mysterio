import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import { chatContainerStore, profileStore, userInfoDialogStore } from 'stores';

const UserInfoDialog = () => {
  const [textFieldValue, setTextFieldValue] = useState('');

  const handleTextFieldChange = (e) => {
    setTextFieldValue(e.target.value);
  };

  const handleDialogueButtonClick = () => {
    userInfoDialogStore.setShouldOpen(false);
    profileStore.setName(textFieldValue);
    chatContainerStore.addChatWindow(userInfoDialogStore.roomId);
  };

  return (
    <Dialog
      open={userInfoDialogStore.shouldOpen}
      onClose={() => userInfoDialogStore.setShouldOpen(false)}
      onKeyPress={(e) => e.key === 'Enter' && textFieldValue && handleDialogueButtonClick()}
    >
      <DialogTitle>Let&apos;s get started!</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          fullWidth
          value={textFieldValue}
          onChange={handleTextFieldChange}
        />
      </DialogContent>
      <DialogActions>
        <Button disabled={!textFieldValue} onClick={handleDialogueButtonClick} color="primary">
          Go
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(UserInfoDialog);
