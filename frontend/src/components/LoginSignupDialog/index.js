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
  const [usernameFieldData, setUsernameFieldData] = useState({
    help_text: '',
    error: false,
  });
  const [passwordFieldData, setPasswordFieldData] = useState({
    help_text: '',
    error: false,
  });

  useEffect(() => {
    fetchUrl('/api/users/', {
      method: 'options',
    }).then((response) => {
      const responseData = response.data;
      setPostActions(responseData.actions.POST);
      setUsernameFieldData({
        help_text: responseData.actions.POST.username.help_text,
        error: false,
      });
      setPasswordFieldData({
        help_text: responseData.actions.POST.password.help_text,
        error: false,
      });
    });
  }, []);

  const handleDialogueButtonClick = () => {
    const endPoint = shouldSignup ? '/api/users/' : '/api/login/';
    fetchUrl(endPoint, {
      method: 'post',
      body: JSON.stringify({ username, password }),
    }).then((response) => {
      const responseData = response.data;
      const newUsernameFieldData = { ...usernameFieldData };
      const newPasswordFieldData = { ...passwordFieldData };
      if (response.status >= 400) {
        if (responseData.username) {
          [newUsernameFieldData.help_text] = responseData.username;
          newUsernameFieldData.error = true;
        } else {
          newUsernameFieldData.help_text = shouldSignup
            ? postActions.username.help_text
            : 'Enter your registered username';
          newUsernameFieldData.error = false;
        }
        if (responseData.password) {
          [newPasswordFieldData.help_text] = responseData.password;
          newPasswordFieldData.error = true;
        } else {
          newPasswordFieldData.help_text = postActions.password.help_text;
          newPasswordFieldData.error = false;
        }
        const action = shouldSignup ? 'register' : 'login';
        appStore.setAlert({
          // eslint-disable-next-line no-underscore-dangle
          text: responseData.__all__ ? responseData.__all__[0] : `Unable to ${action}.`,
          severity: 'error',
        });
        appStore.setShouldShowAlert(true);
        appStore.setShouldOpenLoginSignupDialog(true);
      } else {
        profileStore.setUsername(username);
        if (!shouldSignup) {
          appStore.setShouldOpenLoginSignupDialog(false);
          appStore.setShouldOpenNewGroupDialog(true);
        } else {
          setShouldSignup(false);
          appStore.setAlert({
            text: `Registered successfully. Login to proceed.`,
            severity: 'success',
          });
          appStore.setShouldShowAlert(true);
          newUsernameFieldData.help_text = 'Enter your registered username';
          newUsernameFieldData.error = false;
          newPasswordFieldData.help_text = postActions.password.help_text;
          newPasswordFieldData.error = false;
          setUsername('');
          setPassword('');
        }
      }
      setUsernameFieldData(newUsernameFieldData);
      setPasswordFieldData(newPasswordFieldData);
    });
  };

  let usernameHelperText;
  if (usernameFieldData.error) {
    usernameHelperText = usernameFieldData.help_text;
  } else {
    usernameHelperText = shouldSignup
      ? usernameFieldData.help_text
      : 'Enter your registered username';
  }

  return (
    <Dialog
      open={appStore.shouldOpenLoginSignupDialog}
      onClose={() => appStore.setShouldOpenLoginSignupDialog(false)}
      onKeyPress={(e) => e.key === 'Enter' && handleDialogueButtonClick()}
      fullWidth
    >
      {shouldSignup ? <DialogTitle>Register</DialogTitle> : <DialogTitle>Login</DialogTitle>}
      <DialogContent>
        {shouldSignup ? (
          <DialogContentText>
            Registration helps us give you admin rights of rooms that you create.
          </DialogContentText>
        ) : (
          <DialogContentText>
            Login to create a new room. Select register below if not already registered.
          </DialogContentText>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Username"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          helperText={usernameHelperText}
          required={postActions.username.required}
          inputProps={{ maxLength: postActions.username.max_length }}
          error={usernameFieldData.error}
        />
        <TextField
          margin="dense"
          label="Password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={postActions.password.required}
          helperText={passwordFieldData.help_text}
          error={passwordFieldData.error}
          inputProps={{ type: 'password' }}
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
        <Button onClick={handleDialogueButtonClick} color="primary">
          {shouldSignup ? 'Register' : 'Login'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(LoginSignupDialog);
