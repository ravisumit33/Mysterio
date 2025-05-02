import PropTypes from 'prop-types';
import React from 'react';
import AlertProvider from './alert';
import GlobalDialogProvider from './globalDialog';
import HydrationProvider from './hydration';
import ProfileProvider from './profile';
import UserProvider from './user';
import WaitScreenProvider from './waitScreen';

export default function RootProvider({ children }) {
  return (
    <WaitScreenProvider>
      <AlertProvider>
        <HydrationProvider>
          <UserProvider>
            <ProfileProvider>
              <GlobalDialogProvider>{children}</GlobalDialogProvider>
            </ProfileProvider>
          </UserProvider>
        </HydrationProvider>
      </AlertProvider>
    </WaitScreenProvider>
  );
}

RootProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
