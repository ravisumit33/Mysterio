import PropTypes from 'prop-types';
import React from 'react';
import ProfileProvider from './profile';

export default function RootProvider({ children }) {
  return <ProfileProvider>{children}</ProfileProvider>;
}

RootProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
