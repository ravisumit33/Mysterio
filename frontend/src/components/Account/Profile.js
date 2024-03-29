import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Box, Button, Grid, TextField, Typography } from '@material-ui/core';
import { appStore, profileStore } from 'stores';
import RouterLink from 'components/RouterLink';
import { fetchUrl } from 'utils';
import CenterPaper from 'components/CenterPaper';
import ConfirmationDialog from 'components/ConfirmationDialog';

function Profile() {
  const history = useHistory();
  const location = useLocation();

  const [shouldShowDeleteConfirmationDialog, setShouldShowDeleteConfirmationDialog] =
    useState(false);

  const handleDeleteAccount = () => {
    appStore.showWaitScreen('Deleting');
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
      })
      .finally(() => appStore.setShouldShowWaitScreen(false));
  };

  return (
    <>
      <CenterPaper>
        <Grid item container direction="column" spacing={1}>
          <Grid item>
            <TextField disabled margin="dense" fullWidth value={profileStore.email} label="Email" />
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
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setShouldShowDeleteConfirmationDialog(true)}
                >
                  Delete Account
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </CenterPaper>
      <ConfirmationDialog
        shouldShow={shouldShowDeleteConfirmationDialog}
        onClose={() => setShouldShowDeleteConfirmationDialog(false)}
        onCancel={() => setShouldShowDeleteConfirmationDialog(false)}
        onContinue={handleDeleteAccount}
        title="Delete your account?"
        description="This will permanently delete your account and you will no longer be admin of your rooms."
      />
    </>
  );
}

export default observer(Profile);
