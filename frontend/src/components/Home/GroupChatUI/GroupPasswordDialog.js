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
} from '@material-ui/core';
import { appStore } from 'stores';
import { fetchUrl } from 'utils';

const GroupPasswordDialog = (props) => {
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
    fetchUrl(`/api/chat/groups/${chatWindowData.roomId}/check_password/`, {
      method: 'post',
      body: { password: selectedGroupPassword },
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
      onKeyPress={(e) => e.key === 'Enter' && groupPasswordCheck()}
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
            margin="dense"
            label="Password"
            fullWidth
            value={selectedGroupPassword}
            onChange={(evt) => setSelectedGroupPassword(evt.target.value)}
            required
            helperText={protectedGroupPasswordFieldData.help_text}
            error={protectedGroupPasswordFieldData.error}
            inputProps={{ type: 'password' }}
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
};

GroupPasswordDialog.propTypes = {
  shouldOpenGroupPasswordDialog: PropTypes.bool,
  setShouldOpenGroupPasswordDialog: PropTypes.func.isRequired,
  handleStartGroupChat: PropTypes.func.isRequired,
  chatWindowData: PropTypes.shape({
    roomId: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

GroupPasswordDialog.defaultProps = {
  shouldOpenGroupPasswordDialog: false,
};

export default observer(GroupPasswordDialog);
