import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { appStore } from 'stores';
import { fetchUrl } from 'utils';

function GroupPasswordDialog(props) {
  const {
    shouldOpenGroupPasswordDialog,
    setShouldOpenGroupPasswordDialog,
    handleStartGroupChat,
    chatWindowData,
  } = props;

  const defaultPasswordFieldData = {
    help_text: '',
    error: false,
  };

  const [selectedGroupPassword, setSelectedGroupPassword] = useState('');
  const [protectedGroupPasswordFieldData, setProtectedGroupPasswordFieldData] =
    useState(defaultPasswordFieldData);

  const groupPasswordCheck = () => {
    appStore.showWaitScreen('Validating password');
    fetchUrl(`/api/chat/group_rooms/${chatWindowData.roomId}/check_password/`, {
      headers: { 'X-Group-Password': selectedGroupPassword },
    })
      .then((response) => {
        setShouldOpenGroupPasswordDialog(false);
        handleStartGroupChat({ ...chatWindowData, password: selectedGroupPassword });
        appStore.setShouldShowAlert(false);
      })
      .catch((response) => {
        appStore.showAlert({
          text: 'Invalid room password.',
          severity: 'error',
        });
        setShouldOpenGroupPasswordDialog(true);
        const newProtectedGroupPasswordFieldData = { ...protectedGroupPasswordFieldData };
        newProtectedGroupPasswordFieldData.error = true;
        setProtectedGroupPasswordFieldData(newProtectedGroupPasswordFieldData);
      })
      .finally(() => appStore.setShouldShowWaitScreen(false));
  };

  return (
    <Dialog
      open={shouldOpenGroupPasswordDialog}
      onClose={() => setShouldOpenGroupPasswordDialog(false)}
    >
      <DialogTitle>Enter Password</DialogTitle>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          groupPasswordCheck();
        }}
      >
        <DialogContent>
          <DialogContentText>This room is protected with a password</DialogContentText>
          <TextField
            autoFocus
            label="Password"
            size="small"
            fullWidth
            value={selectedGroupPassword}
            onChange={(evt) => setSelectedGroupPassword(evt.target.value)}
            required
            helperText={protectedGroupPasswordFieldData.help_text}
            error={protectedGroupPasswordFieldData.error}
            InputProps={{ type: 'password' }}
            inputProps={{ maxLength: 20 }}
          />
        </DialogContent>
        <DialogActions>
          <Button type="submit" color="primary">
            Enter room
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

GroupPasswordDialog.propTypes = {
  shouldOpenGroupPasswordDialog: PropTypes.bool,
  setShouldOpenGroupPasswordDialog: PropTypes.func.isRequired,
  handleStartGroupChat: PropTypes.func.isRequired,
  chatWindowData: PropTypes.shape({
    roomId: PropTypes.number.isRequired,
  }).isRequired,
};

GroupPasswordDialog.defaultProps = {
  shouldOpenGroupPasswordDialog: false,
};

export default observer(GroupPasswordDialog);
