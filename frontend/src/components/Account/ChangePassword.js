import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
} from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { fetchUrl } from 'utils';
import { appStore } from 'stores';

const ChangePassword = () => {
  const history = useHistory();
  const location = useLocation();
  // @ts-ignore
  const { from } = location.state || { from: { pathname: '/' } };
  const [newPassword, setNewPassword] = useState('');
  const [shouldUnmaskPassword, setShouldUnmaskPassword] = useState(false);

  const handleFormSubmit = () => {
    fetchUrl('/api/account/password/change/', {
      method: 'post',
      body: { new_password1: newPassword, new_password2: newPassword },
    }).then((response) => {
      appStore.setShouldShowAlert(false);
      if (response.status >= 400) {
        appStore.setAlert({
          text: `Unable to change password. Password must contain atleast 8 characters and should not be too common`,
          severity: 'error',
        });
      } else {
        appStore.setAlert({
          text: `Password changed successfully.`,
          severity: 'success',
        });
      }
      history.push(from);
      appStore.setShouldShowAlert(true);
    });
  };

  return (
    <Box my={3}>
      <Container maxWidth="sm">
        <Paper variant="elevation" elevation={2}>
          <Box p={3}>
            <form
              onSubmit={(evt) => {
                evt.preventDefault();
                handleFormSubmit();
              }}
            >
              <Grid item container direction="column" spacing={1}>
                <Grid item>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="New Password"
                    fullWidth
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
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
                    autoComplete="new-password"
                  />
                </Grid>
                <Grid item container direction="row-reverse">
                  <Grid item>
                    <Box pt={1}>
                      <Button type="submit" color="primary">
                        Submit
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ChangePassword;
