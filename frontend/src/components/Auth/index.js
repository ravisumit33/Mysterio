import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import { Box, Container, Grid, Paper, Typography } from '@material-ui/core';
import { appStore, profileStore } from 'stores';
import { fetchUrl, isCordovaEnv } from 'utils';
import UserForm from './UserForm';

const Auth = (props) => {
  const { shouldRegister } = props;
  const history = useHistory();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [postActions, setPostActions] = useState({ username: {}, password: {} });
  const [usernameFieldData, setUsernameFieldData] = useState({
    help_text: '',
    error: false,
    required: true,
    max_length: 100,
  });
  const [passwordFieldData, setPasswordFieldData] = useState({
    help_text: '',
    error: false,
    required: true,
  });

  // @ts-ignore
  const { from } = location.state || { from: { pathname: '/' } };

  useEffect(() => {
    fetchUrl('/api/users/', {
      method: 'options',
    }).then((response) => {
      const responseData = response.data;
      !shouldRegister &&
        (responseData.actions.POST.username.help_text = 'Enter your registered email');
      setPostActions(responseData.actions.POST);
      setUsernameFieldData({
        help_text: responseData.actions.POST.username.help_text,
        error: false,
        required: responseData.actions.POST.username.required,
        max_length: responseData.actions.POST.username.max_length,
      });
      setPasswordFieldData({
        help_text: responseData.actions.POST.password.help_text || '',
        error: false,
        required: responseData.actions.POST.password.required,
      });
    });
  }, [shouldRegister]);

  const handleFormSubmit = () => {
    const endPoint = shouldRegister ? '/api/users/' : '/api/login/';
    fetchUrl(endPoint, {
      method: 'post',
      body: JSON.stringify({ username, password }),
    }).then((response) => {
      const responseData = response.data;
      const newUsernameFieldData = { ...usernameFieldData };
      const newPasswordFieldData = { ...passwordFieldData };
      if (response.status >= 400) {
        if (responseData.username) {
          [newUsernameFieldData.help_text] = responseData.username;
          newUsernameFieldData.error = true;
        } else {
          newUsernameFieldData.help_text = postActions.username.help_text;
          newUsernameFieldData.error = false;
        }
        if (responseData.password) {
          [newPasswordFieldData.help_text] = responseData.password;
          newPasswordFieldData.error = true;
        } else {
          newPasswordFieldData.help_text = postActions.password.help_text;
          newPasswordFieldData.error = false;
        }
        const action = shouldRegister ? 'register' : 'login';
        appStore.setAlert({
          // eslint-disable-next-line no-underscore-dangle
          text: responseData.__all__ ? responseData.__all__[0] : `Unable to ${action}.`,
          severity: 'error',
        });
        appStore.setShouldShowAlert(true);
        setUsernameFieldData(newUsernameFieldData);
        setPasswordFieldData(newPasswordFieldData);
      } else {
        profileStore.setUsername(username);
        if (!shouldRegister) {
          appStore.setShouldShowAlert(false);
          if (isCordovaEnv()) {
            window.localStorage.setItem('token', responseData.csrf_token);
          }
          appStore.setAlert({
            text: `Login successful.`,
            severity: 'success',
          });
          appStore.setShouldShowAlert(true);
        } else {
          appStore.setAlert({
            text: `Registered successfully.`,
            severity: 'success',
          });
          appStore.setShouldShowAlert(true);
        }
        history.replace(from);
      }
    });
  };

  const loggedIn = (
    <Grid container alignItems="center" direction="column">
      <Grid item>
        <Typography
          variant="h6"
          align="center"
        >{`You are logged in as ${profileStore.username}`}</Typography>
      </Grid>
    </Grid>
  );

  return (
    <Box my={3}>
      <Container maxWidth="sm">
        <Paper variant="elevation" elevation={2}>
          <Box p={3}>
            {profileStore.isLoggedIn ? (
              loggedIn
            ) : (
              <UserForm
                shouldRegister={shouldRegister}
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                usernameFieldData={usernameFieldData}
                passwordFieldData={passwordFieldData}
                handleFormSubmit={handleFormSubmit}
                redirectTo={from}
              />
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

Auth.propTypes = {
  shouldRegister: PropTypes.bool,
};

Auth.defaultProps = {
  shouldRegister: false,
};

export default observer(Auth);
