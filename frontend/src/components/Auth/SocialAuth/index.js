import React, { useCallback } from 'react';
import { Grid } from '@material-ui/core';
import { appStore, profileStore } from 'stores';
import { fetchUrl, getErrorString } from 'utils';
import GoogleLogin from './Google';

function SocialAuth() {
  const handleSocialLoginSuccess = useCallback((provider, responseData) => {
    appStore.showWaitScreen('Logging you in');
    fetchUrl(`/api/account/${provider}/login/`, {
      method: 'post',
      body: { access_token: responseData.access_token },
    })
      .then((resp) => {
        profileStore.setSocial(true);
        // @ts-ignore
        profileStore.setEmail(resp.data.user.email);
        appStore.showAlert({ text: 'Login Successful', severity: 'success' });
      })
      .catch((resp) => {
        const respData = resp.data;
        appStore.showAlert({
          text: respData.non_field_errors
            ? getErrorString(respData.non_field_errors)
            : `Unable to login using ${provider}`,
          severity: 'error',
        });
      })
      .finally(() => appStore.setShouldShowWaitScreen(false));
  }, []);

  const handleSocialLoginFailure = useCallback((provider) => {
    appStore.showAlert({
      text: `Unable to login using ${provider}`,
      severity: 'error',
    });
  }, []);

  return (
    <Grid container justifyContent="space-between">
      <Grid item>
        <GoogleLogin onSuccess={handleSocialLoginSuccess} onFailure={handleSocialLoginFailure} />
      </Grid>
    </Grid>
  );
}

export default SocialAuth;
