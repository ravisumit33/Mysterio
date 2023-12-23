import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
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
import { appStore } from 'stores';
import { fetchUrl } from 'utils';
import { RoomType } from 'appConstants';
import { useStoredChatWindowData } from 'hooks';
import CustomAvatar from 'components/Avatar';

function RoomPasswordDialog(props) {
  const { shouldOpen, setShouldOpen, handleStartChat } = props;
  const { pathname } = useLocation();
  const history = useHistory();
  const ongoingChatRegex = /^\/chat\/(?<roomType>\w+)\/(?<roomId>[0-9]+)(\/.*)?$/;
  const ongoingChatMatch = pathname.match(ongoingChatRegex);
  let roomId;
  let roomType;
  if (ongoingChatMatch) {
    ({ roomId, roomType } = ongoingChatMatch.groups);
  } else {
    roomType = '';
    roomId = '';
  }
  const [chatWindowData, storeChatWindowData] = useStoredChatWindowData(roomType, roomId);

  const defaultPasswordFieldData = {
    help_text: '',
    error: false,
  };

  const [selectedRoomPassword, setSelectedRoomPassword] = useState('');
  const [protectedRoomPasswordFieldData, setProtectedRoomPasswordFieldData] =
    useState(defaultPasswordFieldData);

  const setChatWindowData = (newChatWindowData) => {
    const isGroupRoom = roomType === RoomType.GROUP;
    storeChatWindowData(newChatWindowData);
    handleStartChat({ ...newChatWindowData, roomId, isGroupRoom });
  };

  const roomPasswordCheck = () => {
    appStore.showWaitScreen('Validating password');
    fetchUrl(`/api/chat/rooms/${roomId}/check_password/`, {
      headers: { 'X-Room-Password': selectedRoomPassword },
    })
      .then((response) => {
        setShouldOpen(false);
        setSelectedRoomPassword('');
        setChatWindowData({
          ...chatWindowData,
          password: selectedRoomPassword,
        });
        appStore.setShouldShowAlert(false);
      })
      .catch((response) => {
        appStore.showAlert({
          text: 'Invalid room password.',
          severity: 'error',
        });
        setShouldOpen(true);
        const newProtectedRoomPasswordFieldData = { ...protectedRoomPasswordFieldData };
        newProtectedRoomPasswordFieldData.error = true;
        setProtectedRoomPasswordFieldData(newProtectedRoomPasswordFieldData);
      })
      .finally(() => appStore.setShouldShowWaitScreen(false));
  };

  return (
    <Dialog open={shouldOpen}>
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
              <CustomAvatar avatarUrl={chatWindowData.avatarUrl} name={chatWindowData.name} />
              <Typography variant="h5" noWrap>
                {chatWindowData.name}
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
          <Button color="secondary" onClick={() => history.push('/')}>
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
  shouldOpen: PropTypes.bool,
  setShouldOpen: PropTypes.func.isRequired,
  handleStartChat: PropTypes.func.isRequired,
};

RoomPasswordDialog.defaultProps = {
  shouldOpen: false,
};

export default observer(RoomPasswordDialog);
