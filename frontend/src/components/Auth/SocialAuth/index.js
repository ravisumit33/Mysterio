import { Grid } from '@material-ui/core';
import React from 'react';
import { appStore, profileStore } from 'stores';
import { fetchUrl, getErrorString } from 'utils';
import GoogleLogin from './Google';

const SocialAuth = (props) => {
  const handleSocialLoginSuccess = (provider, responseData) => {
    fetchUrl(`/api/account/${provider}/login/`, {
      method: 'post',
      body: { access_token: responseData.access_token },
    })
      .then((resp) => {
        profileStore.setSocial(true);
        // @ts-ignore
        profileStore.setEmail(resp.data.user.email);
        appStore.showAlert({ text: 'Login Success', severity: 'success' });
      })
      .catch((resp) => {
        const respData = resp.data;
        appStore.showAlert({
          text: respData.non_field_errors
            ? getErrorString(respData.non_field_errors)
            : `Unable to login using ${provider}`,
          severity: 'error',
        });
      });
  };

  const handleSocialLoginFailure = (provider) => {
    appStore.showAlert({
      text: `Unable to login using ${provider}`,
      severity: 'error',
    });
  };

  return (
    <Grid container justifyContent="space-between">
      <Grid item>
        <GoogleLogin onSuccess={handleSocialLoginSuccess} onFailure={handleSocialLoginFailure} />
      </Grid>
    </Grid>
  );
};

export default SocialAuth;
