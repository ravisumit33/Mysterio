import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import CenterPaper from 'components/CenterPaper';
import RouterLink from 'components/RouterLink';
import Notification from 'components/Notification';
import passwordResetDoneJson from 'assets/animations/password-reset-done.json';
import { appStore } from 'stores';
import { fetchUrl, getErrorString } from 'utils';

function ResetPassword() {
  const { userId, key } = useParams();
  const [resetDone, setResetDone] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordFieldData, setNewPasswordFieldData] = useState({
    help_text: '',
    error: false,
  });
  const [shouldUnmaskNewPassword, setShouldUnmaskPassword] = useState(false);
  const handleFormSubmit = () => {
    fetchUrl('/api/account/password/reset/confirm/', {
      method: 'post',
      body: {
        uid: userId,
        token: key,
        new_password1: newPassword,
        new_password2: newPassword,
      },
    })
      .then(() => {
        setResetDone(true);
      })
      .catch((response) => {
        const responseData = response.data;
        const responseFields = ['new_password2'];
        const newNewPasswordFieldData = { ...newPasswordFieldData };
        if (responseData.new_password2) {
          newNewPasswordFieldData.help_text = getErrorString(responseData.new_password2);
          newNewPasswordFieldData.error = true;
        } else {
          newNewPasswordFieldData.help_text = '';
          newNewPasswordFieldData.error = false;
        }
        setNewPasswordFieldData(newNewPasswordFieldData);
        if (!Object.keys(responseData).some((field) => responseFields.includes(field))) {
          appStore.showAlert({
            text: responseData.non_field_errors
              ? getErrorString(responseData.non_field_errors)
              : 'Unable to reset password',
            severity: 'error',
          });
        }
      })
      .finally(() => appStore.setShouldShowWaitScreen(false));
  };

  const newPasswordComponent = (
    <CenterPaper>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          handleFormSubmit();
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h6" mb={1}>
            Reset Password
          </Typography>

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

  const resetDoneComponent = (
    <CenterPaper>
      <Stack justifyContent="space-around" spacing={2}>
        <Notification
          animationProps={{
            containerId: 'passwordreset',
            animationData: passwordResetDoneJson,
            loop: false,
          }}
          title="Password reset successful"
          description="You can now login into your account with newly set password"
        />
        <RouterLink
          to={{ pathname: '/login', state: { from: '/account' } }}
          tabIndex={-1}
          style={{ alignSelf: 'center' }}
        >
          <Button color="secondary" variant="contained" size="large">
            Login
          </Button>
        </RouterLink>
      </Stack>
    </CenterPaper>
  );

  return resetDone ? resetDoneComponent : newPasswordComponent;
}

export default ResetPassword;
