import React, { useState } from 'react';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { FormControlLabel, TextField, Typography, Switch, Button, Stack } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import { Group } from '@mui/icons-material';
import { appStore, profileStore } from 'stores';
import { fetchUrl } from 'utils';
import { useBasicInfo } from 'hooks';
import CenterPaper from './CenterPaper';
import BasicInfo from './BasicInfo';

const roomAvatarStyles = [
  'identicon',
  'initials',
  'bottts',
  'bottts-neutral',
  'identicon',
  'icons',
  'rings',
  'shapes',
];

function NewRoom() {
  const history = useHistory();
  const location = useLocation();
  // @ts-ignore
  const { name } = location.state || { name: '' };

  const { name: roomName, setName: setRoomName, avatarUrl, setAvatarUrl } = useBasicInfo(name);

  const [shouldUsePwd, setShouldUsePwd] = useState(false);
  const [roomPwd, setRoomPwd] = useState('');
  const [description, setDescription] = useState('');
  const [nameFieldData, setNameFieldData] = useState({
    help_text: '',
    error: false,
  });
  const [pwdFieldData, setPwdFieldData] = useState({
    help_text: '',
    error: false,
  });
  const [descriptionFieldData, setDescriptionFieldData] = useState({
    help_text: '',
    error: false,
  });

  const { showWaitScreen, setShouldShowWaitScreen, addChatWindow, showAlert, setShouldShowAlert } =
    appStore;

  const handleCreateRoom = () => {
    if (!avatarUrl) {
      appStore.showAlert({
        text: 'No image chosen. Upload your own or click on choose random.',
        severity: 'error',
      });
      return;
    }
    showWaitScreen('Creating new room');

    let fileUploadPromise = Promise.resolve(avatarUrl);
    if (/^blob:.*$/.test(avatarUrl)) {
      const formData = new FormData();
      formData.append('file', avatarUrl);
      fileUploadPromise = fetchUrl('/api/upload_avatar/', {
        method: 'post',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then((resp) => {
        const responseData = resp.data;
        // @ts-ignore
        const { url } = responseData;
        return url;
      });
    }

    fileUploadPromise
      .then((url) => {
        fetchUrl('/api/chat/group_rooms/', {
          method: 'post',
          body: {
            name: roomName,
            description,
            password: roomPwd,
            avatar_url: url,
            is_protected: shouldUsePwd,
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
              // @ts-ignore
              description: responseData.description,
              password: roomPwd,
              avatarUrl: url,
              isGroupRoom: true,
            };
            addChatWindow(chatWindowData);
            history.push('/chat');
          })
          .catch((response) => {
            const responseData = response.data;
            const groupNameFieldData = { ...nameFieldData };
            const groupPasswordFieldData = { ...pwdFieldData };
            const groupDescriptionFieldData = { ...descriptionFieldData };
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
            if (responseData.description) {
              [groupDescriptionFieldData.help_text] = responseData.description;
              groupDescriptionFieldData.error = true;
            } else {
              groupDescriptionFieldData.help_text = '';
              groupDescriptionFieldData.error = false;
            }
            showAlert({
              text: 'Error occurred while creating room.',
              severity: 'error',
            });
            setNameFieldData(groupNameFieldData);
            setPwdFieldData(groupPasswordFieldData);
            setDescriptionFieldData(groupDescriptionFieldData);
          })
          .finally(() => setShouldShowWaitScreen(false));
      })
      .catch(() => {
        appStore.showAlert({
          text: 'Error occured while creating avatar. Try choosing random one.',
          severity: 'error',
        });
      });
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
        <Stack spacing={1}>
          <Typography variant="h6">New Room</Typography>
          <BasicInfo
            name={roomName}
            onNameChange={setRoomName}
            nameProps={{
              error: nameFieldData.error,
              helpText: nameFieldData.help_text,
              label: 'Name',
            }}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            avatarProps={{
              DefaultIcon: Group,
              styles: roomAvatarStyles,
            }}
          />
          <TextField
            label="description"
            size="small"
            fullWidth
            multiline
            value={description}
            onChange={(evt) => setDescription(evt.target.value)}
            helperText={descriptionFieldData.help_text}
            error={descriptionFieldData.error}
            inputProps={{ maxLength: 100 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={shouldUsePwd}
                onChange={(evt) => setShouldUsePwd(evt.target.checked)}
              />
            }
            label="Protect with password"
          />
          <Collapse in={shouldUsePwd}>
            <TextField
              autoFocus
              disabled={!shouldUsePwd}
              label="Password"
              size="small"
              fullWidth
              value={roomPwd}
              onChange={(evt) => setRoomPwd(evt.target.value)}
              required
              helperText={shouldUsePwd && pwdFieldData.help_text}
              error={shouldUsePwd && pwdFieldData.error}
              InputProps={{ type: 'password' }}
              inputProps={{ maxLength: 20 }}
            />
          </Collapse>
          <Button type="submit" color="primary" sx={{ alignSelf: 'flex-end' }}>
            Create Room
          </Button>
        </Stack>
      </form>
    </CenterPaper>
  );
}

export default observer(NewRoom);
