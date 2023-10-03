import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { fetchUrl } from 'utils';
import CenterPaper from 'components/CenterPaper';
import RouterLink from 'components/RouterLink';
import Notification from 'components/Notification';
import welcomeJson from 'assets/animations/welcome.json';
import { appStore } from 'stores';

const ConfirmEmail = () => {
  // @ts-ignore
  const { key } = useParams();
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  useEffect(() => {
    appStore.showWaitScreen('Verifying');
    fetchUrl('/api/account/registration/verify-email/', { method: 'post', body: { key } })
      .then(() => {
        setEmailConfirmed(true);
      })
      .catch(() =>
        appStore.showAlert({
          text: 'Error occured while verifying email',
          severity: 'error',
        })
      )
      .finally(() => appStore.setShouldShowWaitScreen(false));
  }, [key]);

  const welcomeComponent = !emailConfirmed ? null : (
    <CenterPaper>
      <Stack justifyContent="space-around" spacing={2}>
        <Notification
          animationProps={{
            containerId: 'welcome',
            animationData: welcomeJson,
          }}
          title="Welcome to Mysterio!!"
          description="Thank you for signing up. Wear the anonymous gown and get ready to enter mysterio."
        />
        <RouterLink
          to={{ pathname: '/login', state: { from: '/account' } }}
          tabIndex={-1}
          style={{ alignSelf: 'center' }}
        >
          <Button color="secondary" variant="contained" size="large">
            Login
          </Button>
        </RouterLink>
      </Stack>
    </CenterPaper>
  );

  return welcomeComponent;
};

export default ConfirmEmail;
