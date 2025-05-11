import PropTypes from 'prop-types';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AlertProvider from './alert';
import GlobalDialogProvider from './globalDialog';
import HydrationProvider from './hydration';
import ProfileProvider from './profile';
import UserProvider from './user';
import WaitScreenProvider from './waitScreen';

const queryClient = new QueryClient();

export default function RootProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

RootProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
