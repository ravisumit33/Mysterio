import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Button, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { fetchUrl, getErrorString } from 'utils';
import { appStore } from 'stores';
import CenterPaper from 'components/CenterPaper';

function ChangePassword() {
  const history = useHistory();
  const location = useLocation();
  // @ts-ignore
  const { from } = location.state || { from: { pathname: '/' } };
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [shouldUnmaskNewPassword, setShouldUnmaskPassword] = useState(false);
  const [oldPasswordFieldData, setOldPasswordFieldData] = useState({
    help_text: '',
    error: false,
  });
  const passwordHelpText =
    'Password must contain atleast 8 characters and should not be too common';
  const [newPasswordFieldData, setNewPasswordFieldData] = useState({
    help_text: passwordHelpText,
    error: false,
  });

  const handleFormSubmit = () => {
    appStore.showWaitScreen('Please wait');
    fetchUrl('/api/account/password/change/', {
      method: 'post',
      body: {
        old_password: oldPassword,
        new_password1: newPassword,
        new_password2: newPassword,
      },
    })
      .then(() => {
        appStore.showAlert({
          text: `Password changed successfully.`,
          severity: 'success',
        });
        history.push(from);
      })
      .catch((response) => {
        const responseData = response.data;
        const responseFields = ['old_password', 'new_password2'];
        const newOldPasswordFieldData = { ...oldPasswordFieldData };
        const newNewPasswordFieldData = { ...newPasswordFieldData };
        if (responseData.old_password) {
          newOldPasswordFieldData.help_text = getErrorString(responseData.old_password);
          newOldPasswordFieldData.error = true;
        } else {
          newOldPasswordFieldData.help_text = '';
          newOldPasswordFieldData.error = false;
        }
        if (responseData.new_password2) {
          newNewPasswordFieldData.help_text = getErrorString(responseData.new_password2);
          newNewPasswordFieldData.error = true;
        } else {
          newNewPasswordFieldData.help_text = passwordHelpText;
          newNewPasswordFieldData.error = false;
        }
        setOldPasswordFieldData(newOldPasswordFieldData);
        setNewPasswordFieldData(newNewPasswordFieldData);
        if (!Object.keys(responseData).some((key) => responseFields.includes(key))) {
          appStore.showAlert({
            text: responseData.detail
              ? getErrorString(responseData.detail)
              : 'Error occurred while changing password',
            severity: 'error',
          });
        }
      })
      .finally(() => appStore.setShouldShowWaitScreen(false));
  };

  return (
    <CenterPaper>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          handleFormSubmit();
        }}
      >
        <Stack spacing={1}>
          <TextField
            autoFocus
            label="Old Password"
            size="small"
            fullWidth
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            helperText={oldPasswordFieldData.help_text}
            required
            InputProps={{
              type: 'password',
            }}
            inputProps={{ maxLength: 20 }}
            error={oldPasswordFieldData.error}
            autoComplete="current-password"
          />
          <TextField
            label="New Password"
            size="small"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText={newPasswordFieldData.help_text}
            required
            inputProps={{ maxLength: 20 }}
            InputProps={{
              ...(!shouldUnmaskNewPassword && { type: 'password' }),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onMouseUp={() => setShouldUnmaskPassword(!shouldUnmaskNewPassword)}
                    disableRipple
                    size="large"
                  >
                    {shouldUnmaskNewPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={newPasswordFieldData.error}
            autoComplete="new-password"
          />
          <Button type="submit" color="primary" sx={{ alignSelf: 'flex-end' }}>
            Submit
          </Button>
        </Stack>
      </form>
    </CenterPaper>
  );
}

export default ChangePassword;
