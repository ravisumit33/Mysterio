import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Backdrop, Box, Button, CircularProgress, Grid, Typography } from '@material-ui/core';
import { fetchUrl } from 'utils';
import CenterPaper from 'components/CenterPaper';
import RouterLink from 'components/RouterLink';

const ConfirmEmail = () => {
  // @ts-ignore
  const { key } = useParams();
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  useEffect(() => {
    fetchUrl('/api/account/registration/verify-email/', { method: 'post', body: { key } })
      .then(() => {
        setEmailConfirmed(true);
      })
      .catch();
  }, [key]);

  const welcomeComponent = (
    <CenterPaper>
      <Grid container direction="column" justifyContent="space-around" spacing={3}>
        <Grid item container>
          <Grid item xs={12}>
            <Typography variant="h3">Welcome to Mysterio!!</Typography>
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
              <Button color="primary" variant="contained" size="large">
                Login
              </Button>
            </RouterLink>
          </Grid>
        </Grid>
      </Grid>
    </CenterPaper>
  );

  const waitComponent = (
    <Backdrop open={!emailConfirmed}>
      <Typography variant="body1">Verifying...</Typography>
      <Box ml={2}>
        <CircularProgress color="inherit" />
      </Box>
    </Backdrop>
  );
  return !emailConfirmed ? waitComponent : welcomeComponent;
};

export default ConfirmEmail;
