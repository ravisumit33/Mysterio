import React, { useState } from 'react';
import PropTypes from 'prop-types';
import RouterLink from 'components/RouterLink';
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

const UserForm = (props) => {
  const {
    shouldRegister,
    username,
    setUsername,
    password,
    setPassword,
    usernameFieldData,
    passwordFieldData,
    handleFormSubmit,
    redirectTo,
  } = props;
  const [shouldUnmaskPassword, setShouldUnmaskPassword] = useState(false);

  return (
    <form
      onSubmit={(evt) => {
        evt.preventDefault();
        handleFormSubmit();
      }}
    >
      <Grid item container direction="column" spacing={1}>
        <Grid item>
          <Typography variant="h6">{shouldRegister ? 'Register' : 'Login'}</Typography>
          <Typography variant="body1" color="textSecondary">
            {shouldRegister
              ? 'Registration helps us give you admin rights of rooms that you create.'
              : 'Login with your registered credentials. Click on register if not already registered.'}
          </Typography>
        </Grid>
        <Grid item>
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            helperText={usernameFieldData.help_text}
            required={usernameFieldData.required}
            inputProps={{
              maxLength: usernameFieldData.max_length,
              type: 'email',
            }}
            error={usernameFieldData.error}
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
            required={passwordFieldData.required}
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
            <Box py={1}>
              {!shouldRegister && (
                <RouterLink
                  to={{ pathname: '/register', state: { from: redirectTo } }}
                  tabIndex={-1}
                >
                  <Button color="primary">Register</Button>
                </RouterLink>
              )}
              <Button type="submit" color="primary">
                {shouldRegister ? 'Register' : 'Login'}
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
  username: PropTypes.string.isRequired,
  setUsername: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  usernameFieldData: PropTypes.shape({
    help_text: PropTypes.string.isRequired,
    error: PropTypes.bool.isRequired,
    required: PropTypes.bool.isRequired,
    max_length: PropTypes.number.isRequired,
  }).isRequired,
  passwordFieldData: PropTypes.shape({
    help_text: PropTypes.string.isRequired,
    error: PropTypes.bool.isRequired,
    required: PropTypes.bool.isRequired,
  }).isRequired,
  handleFormSubmit: PropTypes.func.isRequired,
  redirectTo: PropTypes.string,
};

UserForm.defaultProps = {
  redirectTo: '/',
};

export default UserForm;
