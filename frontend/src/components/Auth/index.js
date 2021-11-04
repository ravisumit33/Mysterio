import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import { Box, Container, Grid, Paper } from '@material-ui/core';
import { profileStore } from 'stores';
import UserForm from './UserForm';
import SocialAuth from './SocialAuth';

const Auth = (props) => {
  const { shouldRegister } = props;
  const history = useHistory();
  const location = useLocation();
  // @ts-ignore
  const { from } = location.state || { from: { pathname: '/' } };

  useEffect(() => {
    if (profileStore.isLoggedIn) history.replace(from);
  });

  const shouldRenderAuth = profileStore.profileInitialized && !profileStore.isLoggedIn;
  return !shouldRenderAuth ? (
    <></>
  ) : (
    <Box my={3}>
      <Container maxWidth="sm">
        <Paper variant="elevation" elevation={2}>
          <Box p={3}>
            <Grid container direction="column" justifyContent="space-between" spacing={4}>
              <Grid item>
                <UserForm shouldRegister={shouldRegister} from={from} />
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
