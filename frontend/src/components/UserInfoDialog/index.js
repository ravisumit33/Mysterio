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
import { appStore, profileStore } from 'stores';

const UserInfoDialog = () => {
  const [textFieldValue, setTextFieldValue] = useState('');

  const handleTextFieldChange = (e) => {
    setTextFieldValue(e.target.value);
  };

  const handleDialogueButtonClick = () => {
    appStore.setShouldOpenUserInfoDialog(false);
    profileStore.setName(textFieldValue);
    appStore.addChatWindow();
  };

  return (
    <Dialog
      open={appStore.shouldOpenUserInfoDialog}
      onClose={() => appStore.setShouldOpenUserInfoDialog(false)}
      onKeyPress={(e) => e.key === 'Enter' && textFieldValue && handleDialogueButtonClick()}
    >
      <DialogTitle>Let&apos;s get started!</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Give yourself a name"
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
