import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import CenterPaper from 'components/CenterPaper';
import RouterLink from 'components/RouterLink';
import Notification from 'components/Notification';
import welcomeJson from 'assets/animations/welcome.json';
import { useAlertStore, useTaskRunnerWithLoader, useUserStore } from 'hooks';
import { verifyEmailService } from 'services';

const ConfirmEmail = () => {
  // @ts-ignore
  const { key } = useParams();
  // @ts-ignore
  const { showAlert } = useAlertStore();
  // @ts-ignore
  const { verifyEmail } = useUserStore();
  const runTaskWithLoader = useTaskRunnerWithLoader();
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  useEffect(() => {
    runTaskWithLoader({
      loaderText: 'Verifying',
      task: () =>
        verifyEmail(key)
          .then(() => {
            setEmailConfirmed(true);
          })
          .catch(() =>
            showAlert({
              text: 'Error occured while verifying email',
              severity: 'error',
            })
          ),
    });
  }, [key, showAlert, runTaskWithLoader, verifyEmail]);

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
