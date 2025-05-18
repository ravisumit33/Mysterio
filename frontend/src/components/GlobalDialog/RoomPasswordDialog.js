import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTaskRunnerWithAlert, useTaskRunnerWithLoader, useGlobalDialogStore } from 'hooks';
import CustomAvatar from 'components/Avatar';
import { verifyRoomPasswordService } from 'services';

function RoomPasswordDialog({ payload }) {
  const { onSuccess, onCancel, chatData } = payload;
  const { roomId, name, avatarUrl } = chatData;
  // @ts-ignore
  const { globalDialogStore, closeGlobalDialog } = useGlobalDialogStore();
  const runTaskWithLoader = useTaskRunnerWithLoader();
  const runTaskWithAlert = useTaskRunnerWithAlert();

  const defaultPasswordFieldData = {
    help_text: '',
    error: false,
  };
  const [selectedRoomPassword, setSelectedRoomPassword] = useState('');
  const [protectedRoomPasswordFieldData, setProtectedRoomPasswordFieldData] =
    useState(defaultPasswordFieldData);

  const roomPasswordCheck = () => {
    runTaskWithLoader({
      loaderText: 'Validating password',
      task: () =>
        runTaskWithAlert({
          task: () => verifyRoomPasswordService(roomId, selectedRoomPassword),
          onSuccessCb: () => {
            closeGlobalDialog();
            onSuccess(selectedRoomPassword);
          },
          onErrorCb: (response, showAlertCb) => {
            showAlertCb({
              text: 'Invalid room password.',
              severity: 'error',
            });
            const newProtectedRoomPasswordFieldData = { ...protectedRoomPasswordFieldData };
            newProtectedRoomPasswordFieldData.error = true;
            setProtectedRoomPasswordFieldData(newProtectedRoomPasswordFieldData);
          },
        }),
    });
  };

  return (
    <Dialog open={globalDialogStore.open}>
      <DialogTitle>Enter Password</DialogTitle>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          roomPasswordCheck();
        }}
      >
        <DialogContent>
          <Stack spacing={1}>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 2 }}
              spacing={1}
            >
              <CustomAvatar avatarUrl={avatarUrl} name={name} />
              <Typography variant="h5" noWrap>
                {name}
              </Typography>
            </Stack>
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            onClick={() => {
              closeGlobalDialog();
              onCancel();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" color="primary">
            Enter room
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

RoomPasswordDialog.propTypes = {
  payload: PropTypes.shape({
    chatData: PropTypes.shape({
      roomId: PropTypes.string.isRequired,
      name: PropTypes.string,
      avatarUrl: PropTypes.string,
    }).isRequired,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
  }),
};

RoomPasswordDialog.defaultProps = {
  payload: {
    onSuccess: () => {},
    onCancel: () => {},
  },
};

export default RoomPasswordDialog;
