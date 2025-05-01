import React, { useCallback } from 'react';
import { Stack } from '@mui/material';
import {
  useAlertStore,
  useTaskRunnerWithAlert,
  useTaskRunnerWithLoader,
  useUserStore,
} from 'hooks';
import { getErrorString } from 'utils';
import GoogleLogin from './Google';

function SocialAuth() {
  // @ts-ignore
  const { socialLogin } = useUserStore();
  // @ts-ignore
  const { showAlert } = useAlertStore();
  const runTaskWithLoader = useTaskRunnerWithLoader();
  const runTaskWithAlert = useTaskRunnerWithAlert();
  const handleSocialLoginSuccess = useCallback(
    (provider, responseData) => {
      runTaskWithLoader({
        loaderText: 'Logging you in',
        task: () =>
          runTaskWithAlert({
            task: () => socialLogin(provider, { access_token: responseData.access_token }),
            onSuccessCb: (resp, showAlertCb) => {
              showAlertCb({ text: 'Login Successful', severity: 'success' });
            },
            onErrorCb: (resp, showAlertCb) => {
              const respData = resp.data;
              showAlertCb({
                text: respData.non_field_errors
                  ? getErrorString(respData.non_field_errors)
                  : `Unable to login using ${provider}`,
                severity: 'error',
              });
            },
          }),
      });
    },
    [socialLogin, runTaskWithLoader, runTaskWithAlert]
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
