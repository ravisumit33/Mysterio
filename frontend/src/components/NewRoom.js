import React, { useState } from 'react';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {
  FormControlLabel,
  Grid,
  TextField,
  Typography,
  Switch,
  Box,
  Button,
} from '@material-ui/core';
import { appStore, profileStore } from 'stores';
import { fetchUrl } from 'utils';
import CenterPaper from './CenterPaper';

const NewRoom = () => {
  const history = useHistory();
  const location = useLocation();
  // @ts-ignore
  const { name } = location.state || { name: '' };

  const [roomName, setRoomName] = useState(name);
  const [shouldUsePwd, setShouldUsePwd] = useState(false);
  const [roomPwd, setRoomPwd] = useState('');
  const [nameFieldData, setNameFieldData] = useState({
    help_text: '',
    error: false,
  });
  const [pwdFieldData, setPwdFieldData] = useState({
    help_text: '',
    error: false,
  });

  const { showWaitScreen, setShouldShowWaitScreen, addChatWindow, showAlert, setShouldShowAlert } =
    appStore;

  const handleCreateRoom = () => {
    showWaitScreen('Creating new room');
    fetchUrl('/api/chat/group_rooms/', {
      method: 'post',
      body: {
        name: roomName,
        password: roomPwd,
        is_protected: shouldUsePwd,
        isGroupRoom: true,
      },
    })
      .then((response) => {
        setShouldShowAlert(false);
        const responseData = response.data;
        const chatWindowData = {
          // @ts-ignore
          roomId: responseData.id,
          // @ts-ignore
          name: responseData.name,
          password: roomPwd,
        };
        addChatWindow(chatWindowData);
        history.push('/chat');
      })
      .catch((response) => {
        const responseData = response.data;
        const groupNameFieldData = { ...nameFieldData };
        const groupPasswordFieldData = { ...pwdFieldData };
        if (responseData.name) {
          [groupNameFieldData.help_text] = responseData.name;
          groupNameFieldData.error = true;
        } else {
          groupNameFieldData.help_text = '';
          groupNameFieldData.error = false;
        }
        if (responseData.password) {
          [groupPasswordFieldData.help_text] = responseData.password;
          groupPasswordFieldData.error = true;
        } else {
          groupPasswordFieldData.help_text = '';
          groupPasswordFieldData.error = false;
        }
        showAlert({
          text: 'Error occurred while creating room.',
          severity: 'error',
        });
        setNameFieldData(groupNameFieldData);
        setPwdFieldData(groupPasswordFieldData);
      })
      .finally(() => setShouldShowWaitScreen(false));
  };

  return !profileStore.isLoggedIn ? (
    <Redirect
      to={{
        pathname: '/login',
        state: { from: location },
      }}
    />
  ) : (
    <CenterPaper>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          handleCreateRoom();
        }}
      >
        <Grid item container direction="column" spacing={1}>
          <Grid item>
            <Typography variant="h6">New Room</Typography>
          </Grid>
          <Grid item>
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              value={roomName}
              onChange={(evt) => setRoomName(evt.target.value)}
              helperText={nameFieldData.help_text}
              error={nameFieldData.error}
              required
            />
          </Grid>
          <Grid item>
            <FormControlLabel
              control={
                <Switch
                  checked={shouldUsePwd}
                  onChange={(evt) => setShouldUsePwd(evt.target.checked)}
                />
              }
              label="Protect with password"
            />
            {shouldUsePwd && (
              <TextField
                autoFocus
                disabled={!shouldUsePwd}
                margin="dense"
                label="Password"
                fullWidth
                value={roomPwd}
                onChange={(evt) => setRoomPwd(evt.target.value)}
                required
                helperText={shouldUsePwd && pwdFieldData.help_text}
                error={shouldUsePwd && pwdFieldData.error}
                inputProps={{ type: 'password' }}
              />
            )}
          </Grid>
          <Grid item container direction="row-reverse">
            <Grid item>
              <Box pt={1}>
                <Button type="submit" color="primary">
                  Create Room
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </CenterPaper>
  );
};

export default observer(NewRoom);
