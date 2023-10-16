import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import RouterLink from 'components/RouterLink';
import { fetchUrl, getErrorString } from 'utils';
import { appStore, profileStore } from 'stores';

function UserForm(props) {
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
        if (!Object.keys(responseData).some((key) => responseFields.includes(key))) {
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
      <Stack spacing={1}>
        <Box>
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
                    sx={{ textTransform: 'none' }}
                  >
                    Create an account
                  </Button>
                </RouterLink>
              </>
            )}
          </Typography>
        </Box>
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
        <TextField
          label="Password"
          size="small"
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
                  onMouseUp={() => setShouldUnmaskPassword(!shouldUnmaskPassword)}
                  disableRipple
                  size="large"
                >
                  {shouldUnmaskPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          autoComplete={shouldRegister ? 'new-password' : 'current-password'}
        />
        <Button type="submit" color="primary" sx={{ alignSelf: 'flex-end' }}>
          {shouldRegister ? 'Continue' : 'Login'}
        </Button>
      </Stack>
    </form>
  );
}

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
