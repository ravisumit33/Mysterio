import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import { Grid } from '@material-ui/core';
import { profileStore } from 'stores';
import CenterPaper from 'components/CenterPaper';
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
  if (!shouldRenderAuth) return <></>;

  return (
    <CenterPaper>
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
    </CenterPaper>
  );
};

Auth.propTypes = {
  shouldRegister: PropTypes.bool,
};

Auth.defaultProps = {
  shouldRegister: false,
};

export default observer(Auth);
