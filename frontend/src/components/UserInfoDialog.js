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
  const [shouldOpen, setShouldOpen] = useState(true);
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
    setShouldOpen(false);
  };

  return (
    <Dialog open={shouldOpen} onClose={() => profileStore.name && setShouldOpen(false)}>
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
};

export default observer(UserInfoDialog);
