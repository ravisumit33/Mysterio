import React, { useCallback } from 'react';
import { Stack } from '@mui/material';
import { useAlertStore, useTaskRunnerWithLoader, useUserStore } from 'hooks';
import { getErrorString } from 'utils';
import GoogleLogin from './Google';

function SocialAuth() {
  // @ts-ignore
  const { socialLogin } = useUserStore();
  // @ts-ignore
  const { showAlert } = useAlertStore();
  const runTaskWithLoader = useTaskRunnerWithLoader();
  const handleSocialLoginSuccess = useCallback(
    (provider, responseData) => {
      runTaskWithLoader({
        loaderText: 'Logging you in',
        task: () =>
          socialLogin(provider, { access_token: responseData.access_token })
            .then(() => {
              showAlert({ text: 'Login Successful', severity: 'success' });
            })
            .catch((resp) => {
              const respData = resp.data;
              showAlert({
                text: respData.non_field_errors
                  ? getErrorString(respData.non_field_errors)
                  : `Unable to login using ${provider}`,
                severity: 'error',
              });
            }),
      });
    },
    [socialLogin, showAlert, runTaskWithLoader]
  );

  const handleSocialLoginFailure = useCallback(
    (provider) => {
      showAlert({
        text: `Unable to login using ${provider}`,
        severity: 'error',
      });
    },
    [showAlert]
  );

  return (
    <Stack direction="row" justifyContent="space-between">
      <GoogleLogin onSuccess={handleSocialLoginSuccess} onFailure={handleSocialLoginFailure} />
    </Stack>
  );
}

export default SocialAuth;
