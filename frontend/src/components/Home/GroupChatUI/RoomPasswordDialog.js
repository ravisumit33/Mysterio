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

function RoomPasswordDialog(props) {
  const {
    shouldOpenRoomPasswordDialog,
    setShouldOpenRoomPasswordDialog,
    handleStartChat,
    chatWindowData,
  } = props;

  const defaultPasswordFieldData = {
    help_text: '',
    error: false,
  };

  const [selectedRoomPassword, setSelectedRoomPassword] = useState('');
  const [protectedRoomPasswordFieldData, setProtectedRoomPasswordFieldData] =
    useState(defaultPasswordFieldData);

  const roomPasswordCheck = () => {
    appStore.showWaitScreen('Validating password');
    fetchUrl(`/api/chat/rooms/${chatWindowData.roomId}/check_password/`, {
      headers: { 'X-Room-Password': selectedRoomPassword },
    })
      .then((response) => {
        setShouldOpenRoomPasswordDialog(false);
        handleStartChat({ ...chatWindowData, password: selectedRoomPassword });
        appStore.setShouldShowAlert(false);
      })
      .catch((response) => {
        appStore.showAlert({
          text: 'Invalid room password.',
          severity: 'error',
        });
        setShouldOpenRoomPasswordDialog(true);
        const newProtectedRoomPasswordFieldData = { ...protectedRoomPasswordFieldData };
        newProtectedRoomPasswordFieldData.error = true;
        setProtectedRoomPasswordFieldData(newProtectedRoomPasswordFieldData);
      })
      .finally(() => appStore.setShouldShowWaitScreen(false));
  };

  return (
    <Dialog
      open={shouldOpenRoomPasswordDialog}
      onClose={() => setShouldOpenRoomPasswordDialog(false)}
    >
      <DialogTitle>Enter Password</DialogTitle>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          roomPasswordCheck();
        }}
      >
        <DialogContent>
          <DialogContentText>This room is protected with a password</DialogContentText>
          <TextField
            autoFocus
            label="Password"
            size="small"
            fullWidth
            value={selectedRoomPassword}
            onChange={(evt) => setSelectedRoomPassword(evt.target.value)}
            required
            helperText={protectedRoomPasswordFieldData.help_text}
            error={protectedRoomPasswordFieldData.error}
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

RoomPasswordDialog.propTypes = {
  shouldOpenRoomPasswordDialog: PropTypes.bool,
  setShouldOpenRoomPasswordDialog: PropTypes.func.isRequired,
  handleStartChat: PropTypes.func.isRequired,
  chatWindowData: PropTypes.shape({
    roomId: PropTypes.number.isRequired,
    isGroupRoom: PropTypes.bool.isRequired,
  }).isRequired,
};

RoomPasswordDialog.defaultProps = {
  shouldOpenRoomPasswordDialog: false,
};

export default observer(RoomPasswordDialog);
