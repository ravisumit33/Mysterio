import PropTypes from 'prop-types';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AlertProvider from './alert';
import GlobalDialogProvider from './globalDialog';
import GlobalHydrationStatusProvider from './globalHydrationStatus';
import ProfileProvider from './profile';
import UserProvider from './user';
import WaitScreenProvider from './waitScreen';

const queryClient = new QueryClient();

export default function RootProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WaitScreenProvider>
        <AlertProvider>
          <GlobalHydrationStatusProvider>
            <UserProvider>
              <ProfileProvider>
                <GlobalDialogProvider>{children}</GlobalDialogProvider>
              </ProfileProvider>
            </UserProvider>
          </GlobalHydrationStatusProvider>
        </AlertProvider>
      </WaitScreenProvider>
    </QueryClientProvider>
  );
}

RootProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
