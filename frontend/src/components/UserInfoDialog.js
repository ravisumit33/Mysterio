import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
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
  const history = useHistory();
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
    appStore.setShouldOpenUserInfoDialog(false);
    profileStore.setName(textFieldValue);
    appStore.addChatWindow();
    history.push('/chat');
  };

  return (
    <Dialog
      open={appStore.shouldOpenUserInfoDialog}
      onClose={() => appStore.setShouldOpenUserInfoDialog(false)}
    >
      <DialogTitle>Let&apos;s get started!</DialogTitle>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          handleDialogueButtonClick();
          evt.stopPropagation();
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
          />
        </DialogContent>
        <DialogActions>
          <Button
            type="submit"
            onClick={(evt) => {
              evt.preventDefault();
              handleDialogueButtonClick();
              evt.stopPropagation();
            }}
            color="primary"
          >
            Go
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default observer(UserInfoDialog);
