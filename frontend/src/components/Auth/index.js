import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import { Divider, Stack, Typography } from '@mui/material';
import { useUserStore } from 'hooks';
import { isLoggedIn } from 'selectors';
import CenterPaper from 'components/CenterPaper';
import UserForm from './UserForm';
import SocialAuth from './SocialAuth';

function Auth(props) {
  const { shouldRegister } = props;
  const history = useHistory();
  const location = useLocation();
  // @ts-ignore
  const { from } = location.state || { from: { pathname: '/' } };
  // @ts-ignore
  const { userStore } = useUserStore();

  useEffect(() => {
    if (isLoggedIn(userStore)) history.replace(from);
  });

  const shouldRenderAuth = userStore.isHydrated && !isLoggedIn(userStore);
  if (!shouldRenderAuth) return null;

  return (
    <CenterPaper>
      <Stack justifyContent="space-between" spacing={4}>
        <UserForm shouldRegister={shouldRegister} from={from} />
        {!shouldRegister && (
          <>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="caption">OR</Typography>
              <Divider sx={{ flex: 1 }} />
            </Stack>
            <SocialAuth />
          </>
        )}
      </Stack>
    </CenterPaper>
  );
}

Auth.propTypes = {
  shouldRegister: PropTypes.bool,
};

Auth.defaultProps = {
  shouldRegister: false,
};

export default observer(Auth);
