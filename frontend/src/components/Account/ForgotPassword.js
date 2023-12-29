import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Stack, TextField, Typography } from '@mui/material';
import CenterPaper from 'components/CenterPaper';
import { appStore } from 'stores';
import { fetchUrl, getErrorString } from 'utils';

function ForgotPassword() {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [emailFieldData, setEmailFieldData] = useState({
    help_text: '',
    error: false,
  });
  const handleFormSubmit = () => {
    appStore.showWaitScreen('Please wait');
    fetchUrl('/api/account/password/reset/', {
      method: 'post',
      body: {
        email,
      },
    })
      .then(() => {
        history.replace('/account/reset-password-email-sent');
        appStore.showAlert({
          text: `Reset password e-mail sent`,
          severity: 'success',
        });
      })
      .catch((response) => {
        const responseData = response.data;
        const responseFields = ['email'];
        const newEmailFieldData = { ...emailFieldData };
        if (responseData.email) {
          newEmailFieldData.help_text = getErrorString(responseData.email);
          newEmailFieldData.error = true;
        } else {
          newEmailFieldData.help_text = '';
          newEmailFieldData.error = false;
        }
        setEmailFieldData(newEmailFieldData);
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
  return (
    <CenterPaper>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          handleFormSubmit();
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h6" mb={1}>
            Forgot Password
          </Typography>
          <TextField
            autoFocus
            label="Email"
            size="small"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            helperText={emailFieldData.help_text}
            required
            inputProps={{
              type: 'email',
            }}
            error={emailFieldData.error}
            autoComplete="email"
          />
          <Button type="submit" color="primary" sx={{ alignSelf: 'flex-end' }}>
            Submit
          </Button>
        </Stack>
      </form>
    </CenterPaper>
  );
}
export default ForgotPassword;
