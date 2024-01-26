import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Button, Stack, TextField } from '@mui/material';
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
      .then(() => {
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
        <Stack spacing={1}>
          <TextField disabled size="small" fullWidth value={profileStore.email} label="Email" />
          {!profileStore.social && (
            <TextField
              disabled
              label="Password"
              size="small"
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
                    <Button
                      color="primary"
                      variant="text"
                      size="small"
                      sx={{ textTransform: 'none', textWrap: 'nowrap' }}
                    >
                      Change Password
                    </Button>
                  </RouterLink>
                ),
              }}
            />
          )}
          <Button
            color="error"
            onClick={() => setShouldShowDeleteConfirmationDialog(true)}
            sx={{ alignSelf: 'flex-end' }}
          >
            Delete Account
          </Button>
        </Stack>
      </CenterPaper>
      <ConfirmationDialog
        shouldShow={shouldShowDeleteConfirmationDialog}
        onClose={() => setShouldShowDeleteConfirmationDialog(false)}
        onCancel={() => setShouldShowDeleteConfirmationDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Delete your account?"
        description="This will permanently delete your account and you will no longer be admin of your rooms."
      />
    </>
  );
}

export default observer(Profile);
