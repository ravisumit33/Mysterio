import { HydrationKeys } from 'appConstants';
import PropTypes from 'prop-types';
import React from 'react';
import AlertProvider from './alert';
import HydrationProvider from './hydration';
import ProfileProvider from './profile';
import UserProvider from './user';

export default function RootProvider({ children }) {
  return (
    <HydrationProvider keysToHydrate={Object.values(HydrationKeys)}>
      <AlertProvider>
        <UserProvider>
          <ProfileProvider>{children}</ProfileProvider>
        </UserProvider>
      </AlertProvider>
    </HydrationProvider>
  );
}

RootProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
