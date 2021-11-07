import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import { Box, Container, Grid, Paper } from '@material-ui/core';
import { profileStore } from 'stores';
import WaitScreen from 'components/WaitScreen';
import UserForm from './UserForm';
import SocialAuth from './SocialAuth';

const Auth = (props) => {
  const { shouldRegister } = props;
  const history = useHistory();
  const location = useLocation();
  const [shouldShowWaitScreen, setShouldShowWaitScreen] = useState(false);
  // @ts-ignore
  const { from } = location.state || { from: { pathname: '/' } };

  useEffect(() => {
    if (profileStore.isLoggedIn) history.replace(from);
  });

  const shouldRenderAuth = profileStore.profileInitialized && !profileStore.isLoggedIn;
  if (!shouldRenderAuth) return <></>;

  const waitScreenText = shouldRegister ? 'Creating your account' : 'Logging you in';

  const waitComponent = (
    <WaitScreen shouldOpen={shouldShowWaitScreen} waitScreenText={waitScreenText} />
  );
  return shouldShowWaitScreen ? (
    waitComponent
  ) : (
    <Box my={3}>
      <Container maxWidth="sm">
        <Paper variant="elevation" elevation={2}>
          <Box p={3}>
            <Grid container direction="column" justifyContent="space-between" spacing={4}>
              <Grid item>
                <UserForm
                  shouldRegister={shouldRegister}
                  from={from}
                  setShouldShowWaitScreen={setShouldShowWaitScreen}
                />
              </Grid>
              {!shouldRegister && (
                <Grid item>
                  <SocialAuth />
                </Grid>
              )}
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

Auth.propTypes = {
  shouldRegister: PropTypes.bool,
};

Auth.defaultProps = {
  shouldRegister: false,
};

export default observer(Auth);
