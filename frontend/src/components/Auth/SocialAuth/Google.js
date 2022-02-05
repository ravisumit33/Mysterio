import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';

function GoogleLogin(props) {
  const { onSuccess, onFailure } = props;

  useEffect(() => {
    const handleCredentialResponse = (response) => {
      const accessToken = response.credential;
      const provider = 'google';
      if (accessToken) onSuccess(provider, { access_token: accessToken });
      else onFailure(provider);
    };
    globalThis.googleSignInPromise.then(() => {
      globalThis.google.accounts.id.initialize({
        client_id: '466740392558-splc0ctu4oth02mljun7djcgujtkm00r.apps.googleusercontent.com',
        callback: handleCredentialResponse,
        // login_uri: 'http://localhost:8000/api/account/google/login/',
        // ux_mode: 'redirect',
      });
      globalThis.google.accounts.id.renderButton(
        document.getElementById('GoogleLogin'),
        { theme: 'outline', size: 'large' } // customization attributes
      );
      // globalThis.google.accounts.id.prompt(); // also display the One Tap dialog
    });
  }, [onFailure, onSuccess]);

  return <Box id="GoogleLogin" />;
}

GoogleLogin.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func.isRequired,
};

export default GoogleLogin;
