import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Grid, makeStyles, Typography } from '@material-ui/core';
import { fetchUrl } from 'utils';
import CenterPaper from 'components/CenterPaper';
import RouterLink from 'components/RouterLink';
import { ReactComponent as QuickChatImg } from 'assets/images/quick_chat.svg';
import { appStore } from 'stores';

const useStyles = makeStyles((theme) => ({
  quickChatImg: {
    height: 150,
    [theme.breakpoints.down('sm')]: {
      height: 75,
    },
  },
}));

const ConfirmEmail = () => {
  const classes = useStyles();
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

  const welcomeComponent = !emailConfirmed ? (
    <></>
  ) : (
    <CenterPaper>
      <Grid container direction="column" justifyContent="space-around" spacing={3}>
        <Grid item container justifyContent="center">
          <Grid item xs={12} md={7}>
            <Box py={3}>
              <QuickChatImg width="100%" className={classes.quickChatImg} />
            </Box>
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
              <Button color="primary" variant="contained" size="large">
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
