import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Grid, Typography } from '@material-ui/core';
import { fetchUrl } from 'utils';
import CenterPaper from 'components/CenterPaper';
import RouterLink from 'components/RouterLink';
import Animation from 'components/Animation';
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
      <Grid container direction="column" justifyContent="space-around" spacing={1}>
        <Grid item container justifyContent="center" xs={12}>
          <Grid item>
            <Animation
              width={50}
              height={50}
              smallScreenWidth={25}
              smallScreenHeight={25}
              containerId="welcome"
              animationData={welcomeJson}
            />
          </Grid>
        </Grid>
        <Grid item container>
          <Grid item xs={12}>
            <Typography variant="h4">Welcome to Mysterio!!</Typography>
          </Grid>
        </Grid>
        <Grid item container justifyContent="center">
          <Grid item xs={12}>
            <Typography variant="body1">
              Thank you for signing up. Wear the anonymous gown and get ready to enter mysterio.
            </Typography>
          </Grid>
        </Grid>
        <Grid item container justifyContent="center">
          <Grid item>
            <RouterLink to={{ pathname: '/login', state: { from: '/account' } }} tabIndex={-1}>
              <Button color="secondary" variant="contained" size="large">
                Login
              </Button>
            </RouterLink>
          </Grid>
        </Grid>
      </Grid>
    </CenterPaper>
  );

  return welcomeComponent;
};

export default ConfirmEmail;
