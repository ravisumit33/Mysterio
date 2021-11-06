import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Box, Button, Grid, IconButton, InputAdornment, TextField } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { fetchUrl, getErrorString } from 'utils';
import { appStore } from 'stores';
import CenterPaper from 'components/CenterPaper';

const ChangePassword = () => {
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
        if (Object.keys(responseData).some((key) => responseFields.includes(key))) {
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
        } else {
          appStore.showAlert({
            text: responseData.detail
              ? getErrorString(responseData.detail)
              : 'Error occurred while changing password',
            severity: 'error',
          });
        }
      });
  };

  return (
    <CenterPaper>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          handleFormSubmit();
        }}
      >
        <Grid item container direction="column" spacing={1}>
          <Grid item>
            <TextField
              autoFocus
              margin="dense"
              label="Old Password"
              fullWidth
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              helperText={oldPasswordFieldData.help_text}
              required
              InputProps={{
                type: 'password',
              }}
              error={oldPasswordFieldData.error}
              autoComplete="current-password"
            />
          </Grid>
          <Grid item>
            <TextField
              margin="dense"
              label="New Password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText={newPasswordFieldData.help_text}
              required
              InputProps={{
                ...(!shouldUnmaskNewPassword && { type: 'password' }),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onMouseDown={() => setShouldUnmaskPassword(true)}
                      onMouseUp={() => setShouldUnmaskPassword(false)}
                      disableRipple
                    >
                      {shouldUnmaskNewPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={newPasswordFieldData.error}
              autoComplete="new-password"
            />
          </Grid>
          <Grid item container direction="row-reverse">
            <Grid item>
              <Box pt={1}>
                <Button type="submit" color="primary">
                  Submit
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </CenterPaper>
  );
};

export default ChangePassword;
