import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@material-ui/core';
import { appStore, profileStore } from 'stores';
import { fetchUrl } from 'utils';

const LoginSignupDialog = (props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [shouldSignup, setShouldSignup] = useState(false);
  const [postActions, setPostActions] = useState({ username: {}, password: {} });

  useEffect(() => {
    fetchUrl('/api/users/', {
      method: 'options',
    }).then((data) => {
      setPostActions(data.actions.POST);
    });
  }, []);

  const handleDialogueButtonClick = () => {
    const endPoint = shouldSignup ? '/api/users/' : '/api/login/';
    fetchUrl(endPoint, {
      method: 'post',
      body: JSON.stringify({ username, password }),
    }).then((data) => {
      if (data.username !== username) {
        const action = shouldSignup ? 'register' : 'login';
        appStore.setAlert({
          text: `Unable to ${action}.`,
          severity: 'error',
        });
        appStore.setShouldShowAlert(true);
        return;
      }
      profileStore.setUsername(username);
      appStore.setShouldOpenNewGroupDialog(true);
    });
    appStore.setShouldOpenLoginSignupDialog(false);
  };

  const shouldEnableLogin = username !== '' && password !== '';

  return (
    <Dialog
      open={appStore.shouldOpenLoginSignupDialog}
      onClose={() => appStore.setShouldOpenLoginSignupDialog(false)}
      onKeyPress={(e) => e.key === 'Enter' && shouldEnableLogin && handleDialogueButtonClick()}
    >
      {shouldSignup ? <DialogTitle>Register</DialogTitle> : <DialogTitle>Login</DialogTitle>}
      <DialogContent>
        {shouldSignup && (
          <DialogContentText>This helps us make you admin of this group</DialogContentText>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Username"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          helperText={postActions.username.help_text}
          required={postActions.username.required}
          inputProps={{ maxLength: postActions.username.max_length }}
        />
        <TextField
          autoFocus
          margin="dense"
          label="Password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={postActions.password.required}
        />
        <FormControlLabel
          control={
            <Switch
              checked={shouldSignup}
              onChange={(evt) => setShouldSignup(evt.target.checked)}
            />
          }
          label="Register"
        />
      </DialogContent>
      <DialogActions>
        <Button disabled={!shouldEnableLogin} onClick={handleDialogueButtonClick} color="primary">
          {shouldSignup ? 'Register' : 'Login'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(LoginSignupDialog);
