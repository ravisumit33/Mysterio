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

function UserInfoDialog() {
  const [textFieldValue, setTextFieldValue] = useState('');

  const handleTextFieldChange = (e) => {
    setTextFieldValue(e.target.value);
  };

  const handleDialogueButtonClick = () => {
    if (!textFieldValue) {
      appStore.showAlert({
        text: 'Name cannot be empty.',
        severity: 'error',
      });
      return;
    }
    appStore.setShouldShowAlert(false);
    profileStore.setName(textFieldValue);
  };

  const shouldOpen = !profileStore.hasCompleteUserInfo;

  return (
    <Dialog open={shouldOpen}>
      <DialogTitle>Let&apos;s get started!</DialogTitle>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          handleDialogueButtonClick();
        }}
      >
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Give yourself a name"
            fullWidth
            value={textFieldValue}
            onChange={handleTextFieldChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button type="submit" color="primary">
            Go
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default observer(UserInfoDialog);
