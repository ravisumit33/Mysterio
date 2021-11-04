import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Box, Button, Container, Grid, Paper, TextField, Typography } from '@material-ui/core';
import { appStore, profileStore } from 'stores';
import RouterLink from 'components/RouterLink';
import { fetchUrl } from 'utils';

const Profile = () => {
  const history = useHistory();
  const location = useLocation();

  const handleDeleteAccount = () => {
    fetchUrl('/api/account/delete/', {
      method: 'post',
      body: {},
    })
      .then((response) => {
        appStore.showAlert({
          text: `Account deleted successfully.`,
          severity: 'success',
        });
        history.replace('/');
        profileStore.setEmail('');
      })
      .catch(() => {
        appStore.showAlert({
          text: `Error occurred while deleting account. Make sure you are logged in.`,
          severity: 'error',
        });
      });
  };

  return (
    <Box my={3}>
      <Container maxWidth="sm">
        <Paper variant="elevation" elevation={2}>
          <Box p={3}>
            <Grid item container direction="column" spacing={1}>
              <Grid item>
                <TextField
                  disabled
                  margin="dense"
                  fullWidth
                  value={profileStore.email}
                  label="Email"
                />
              </Grid>
              {!profileStore.social && (
                <Grid item>
                  <TextField
                    disabled
                    margin="dense"
                    label="Password"
                    fullWidth
                    value="Dummy Password"
                    InputProps={{
                      type: 'password',
                      endAdornment: (
                        <RouterLink
                          to={{
                            pathname: '/account/change-password',
                            state: { from: location },
                          }}
                        >
                          <Typography variant="caption" noWrap>
                            Change Password
                          </Typography>
                        </RouterLink>
                      ),
                    }}
                  />
                </Grid>
              )}
              <Grid item container direction="row-reverse">
                <Grid item>
                  <Box pt={1}>
                    <Button variant="contained" color="secondary" onClick={handleDeleteAccount}>
                      Delete Account
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default observer(Profile);
