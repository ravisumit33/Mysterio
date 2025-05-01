import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Stack, TextField, Typography } from '@mui/material';
import CenterPaper from 'components/CenterPaper';
import { getErrorString } from 'utils';
import { useTaskRunnerWithAlert, useTaskRunnerWithLoader, useUserStore } from 'hooks';

function ForgotPassword() {
  const history = useHistory();
  // @ts-ignore
  const { forgotPassword } = useUserStore();
  const runTaskWithLoader = useTaskRunnerWithLoader();
  const runTaskWithAlert = useTaskRunnerWithAlert();
  const [email, setEmail] = useState('');
  const [emailFieldData, setEmailFieldData] = useState({
    help_text: '',
    error: false,
  });
  const handleFormSubmit = () => {
    runTaskWithLoader({
      loaderText: 'Please wait',
      task: () =>
        runTaskWithAlert({
          task: () => forgotPassword(email),
          onSuccessCb: (resp, showAlertCb) => {
            history.replace('/account/reset-password-email-sent');
            showAlertCb({
              text: `Reset password e-mail sent`,
              severity: 'success',
            });
          },
          onErrorCb: (response, showAlertCb) => {
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
              showAlertCb({
                text: responseData.non_field_errors
                  ? getErrorString(responseData.non_field_errors)
                  : 'Unable to reset password',
                severity: 'error',
              });
            }
          },
        }),
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
