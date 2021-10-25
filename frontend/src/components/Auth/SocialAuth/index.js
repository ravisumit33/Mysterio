import { Grid } from '@material-ui/core';
import React from 'react';
import { appStore, profileStore } from 'stores';
import { fetchUrl } from 'utils';
import GoogleLogin from './Google';

const SocialAuth = (props) => {
  const handleSocialLoginSuccess = (provider, responseData) => {
    switch (provider) {
      case 'Google':
        fetchUrl('/api/account/google/login/', {
          method: 'post',
          body: { access_token: responseData.access_token },
        }).then((resp) => {
          profileStore.setSocial(true);
          profileStore.setEmail(resp.data.user.email);
          appStore.setShouldShowAlert(false);
          appStore.setAlert({
            text: `Login successful.`,
            severity: 'success',
          });
          appStore.setShouldShowAlert(true);
        });
        break;
      default:
    }
  };

  const handleSocialLoginFailure = (provider) => {
    appStore.setShouldShowAlert(false);
    appStore.setAlert({
      text: `Unable to login using ${provider}`,
      severity: 'error',
    });
    appStore.setShouldShowAlert(true);
  };

  return (
    <Grid container justify="space-between">
      <Grid item>
        {/* <GoogleLogin
            clientId="466740392558-splc0ctu4oth02mljun7djcgujtkm00r.apps.googleusercontent.com"
            buttonText="LOGIN WITH GOOGLE"
            onSuccess={(resp) => handleSocialLoginSuccess('Google', resp)}
            onFailure={(resp) => handleSocialLoginFailure('Google', resp)}
           /> */}
        <GoogleLogin onSuccess={handleSocialLoginSuccess} onFailure={handleSocialLoginFailure} />
      </Grid>
    </Grid>
  );
};

export default SocialAuth;
