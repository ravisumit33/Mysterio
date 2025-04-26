import React, { useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { ProfileContext } from 'stores/contexts';
import { profileReducer, initialProfileState } from 'stores/reducers';

export default function ProfileProvider({ children }) {
  const [profileState, profileDispatch] = useReducer(profileReducer, initialProfileState);
  const value = useMemo(() => ({ profileState, profileDispatch }), [profileState, profileDispatch]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

ProfileProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
