import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
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
import RouterLink from 'components/RouterLink';
import { fetchUrl, getErrorString } from 'utils';
import { appStore, profileStore } from 'stores';

const UserForm = (props) => {
  const { shouldRegister, from } = props;
  const history = useHistory();
  const [shouldUnmaskPassword, setShouldUnmaskPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFieldData, setEmailFieldData] = useState({
    help_text: '',
    error: false,
  });
  const passwordHelpText = shouldRegister
    ? 'Password must contain atleast 8 characters and should not be too common'
    : '';
  const [passwordFieldData, setPasswordFieldData] = useState({
    help_text: passwordHelpText,
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
    appStore.showWaitScreen(shouldRegister ? 'Creating your account' : 'Logging you in');
    fetchUrl(endPoint, {
      method: 'post',
      body: requestBody,
    })
      .then(() => {
        if (!shouldRegister) {
          profileStore.setEmail(email);
          profileStore.setSocial(false);
          history.replace(from);
          appStore.setShouldShowAlert(false);
          appStore.showAlert({
            text: `Login successful.`,
            severity: 'success',
          });
        } else {
          history.replace('/account/confirmation-email-sent/');
          appStore.showAlert({
            text: 'Confirmation e-mail sent',
            severity: 'success',
          });
        }
      })
      .catch((response) => {
        const responseData = response.data;
        const responseFields = ['email', 'password1'];
        if (Object.keys(responseData).some((key) => responseFields.includes(key))) {
          const newEmailFieldData = { ...emailFieldData };
          const newPasswordFieldData = { ...passwordFieldData };
          if (responseData.email) {
            newEmailFieldData.help_text = getErrorString(responseData.email);
            newEmailFieldData.error = true;
          } else {
            newEmailFieldData.help_text = '';
            newEmailFieldData.error = false;
          }
          if (responseData.password1) {
            newPasswordFieldData.help_text = getErrorString(responseData.password1);
            newPasswordFieldData.error = true;
          } else {
            newPasswordFieldData.help_text = passwordHelpText;
            newPasswordFieldData.error = false;
          }
          setEmailFieldData(newEmailFieldData);
          setPasswordFieldData(newPasswordFieldData);
        } else {
          const action = shouldRegister ? 'create an account' : 'login';
          appStore.showAlert({
            text: responseData.non_field_errors
              ? getErrorString(responseData.non_field_errors)
              : `Unable to ${action}.`,
            severity: 'error',
          });
        }
      })
      .finally(() => appStore.setShouldShowWaitScreen(false));
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
            autoComplete="email"
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
                    onMouseDown={() => setShouldUnmaskPassword(true)}
                    onMouseUp={() => setShouldUnmaskPassword(false)}
                    disableRipple
                  >
                    {shouldUnmaskPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            autoComplete={shouldRegister ? 'new-password' : 'current-password'}
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
  from: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

UserForm.defaultProps = {
  from: '/account',
};

export default observer(UserForm);
