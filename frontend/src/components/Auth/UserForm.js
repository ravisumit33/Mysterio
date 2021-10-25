import React, { useState } from 'react';
import PropTypes from 'prop-types';
import RouterLink from 'components/RouterLink';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { fetchUrl } from 'utils';
import { appStore, profileStore } from 'stores';

const UserForm = (props) => {
  const { shouldRegister, from } = props;
  const [shouldUnmaskPassword, setShouldUnmaskPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFieldData, setEmailFieldData] = useState({
    help_text: '',
    error: false,
  });
  const [passwordFieldData, setPasswordFieldData] = useState({
    help_text: '',
    error: false,
  });

  const handleFormSubmit = () => {
    const endPoint = shouldRegister ? '/api/account/registration/' : '/api/account/login/';
    const requestBody = { email };
    if (shouldRegister) {
      requestBody.password1 = password;
      requestBody.password2 = password;
    } else {
      requestBody.password = password;
    }
    fetchUrl(endPoint, {
      method: 'post',
      body: requestBody,
    }).then((response) => {
      const responseData = response.data;
      const newEmailFieldData = { ...emailFieldData };
      const newPasswordFieldData = { ...passwordFieldData };
      if (response.status >= 400) {
        if (responseData.email) {
          [newEmailFieldData.help_text] = responseData.email;
          newEmailFieldData.error = true;
        } else {
          newEmailFieldData.help_text = '';
          newEmailFieldData.error = false;
        }
        if (responseData.password) {
          [newPasswordFieldData.help_text] = responseData.password;
          newPasswordFieldData.error = true;
        } else {
          newPasswordFieldData.help_text = '';
          newPasswordFieldData.error = false;
        }
        const action = shouldRegister ? 'register' : 'login';
        appStore.setAlert({
          // eslint-disable-next-line no-underscore-dangle
          text: responseData.__all__ ? responseData.__all__[0] : `Unable to ${action}.`,
          severity: 'error',
        });
        appStore.setShouldShowAlert(true);
        setEmailFieldData(newEmailFieldData);
        setPasswordFieldData(newPasswordFieldData);
      } else {
        profileStore.setSocial(false);
        profileStore.setEmail(email);
        if (!shouldRegister) {
          appStore.setShouldShowAlert(false);
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
      }
    });
  };

  return (
    <form
      onSubmit={(evt) => {
        evt.preventDefault();
        handleFormSubmit();
      }}
    >
      <Grid item container direction="column" spacing={1}>
        <Grid item>
          <Typography variant="h6">{shouldRegister ? 'Create account' : 'Login'}</Typography>
          <Typography variant="body1" color="textSecondary">
            {shouldRegister ? (
              'You will be given admin rights of rooms that you create.'
            ) : (
              <>
                New user?
                <RouterLink to={{ pathname: '/register', state: { from } }} tabIndex={-1}>
                  <Button
                    color="primary"
                    variant="text"
                    size="small"
                    style={{ textTransform: 'none' }}
                  >
                    Create an account
                  </Button>
                </RouterLink>
              </>
            )}
          </Typography>
        </Grid>
        <Grid item>
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            helperText={emailFieldData.help_text}
            required
            inputProps={{
              type: 'email',
            }}
            error={emailFieldData.error}
            autoComplete="username"
          />
        </Grid>
        <Grid item>
          <TextField
            margin="dense"
            label="Password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText={passwordFieldData.help_text}
            error={passwordFieldData.error}
            InputProps={{
              ...(!shouldUnmaskPassword && { type: 'password' }),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShouldUnmaskPassword(!shouldUnmaskPassword)}
                    disableRipple
                  >
                    {shouldUnmaskPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            autoComplete="current-password"
          />
        </Grid>
        <Grid item container direction="row-reverse">
          <Grid item>
            <Box pt={1}>
              <Button type="submit" color="primary">
                {shouldRegister ? 'Continue' : 'Login'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
};

UserForm.propTypes = {
  shouldRegister: PropTypes.bool.isRequired,
  from: PropTypes.string,
};

UserForm.defaultProps = {
  from: '/',
};

export default observer(UserForm);
