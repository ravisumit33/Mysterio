import React, { useMemo, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { ProfileContext } from 'contexts';
import { profileReducer, initialProfileState, ProfileActions } from 'stores';
import { getStoredProfileData, updateStoredProfileData } from 'utils/browserStorageUtils';
import { useHydration } from 'hooks';
import { HydrationKeys } from 'appConstants';
import withStorage from './withStorage';

const profileReducerWithStorage = withStorage(profileReducer, updateStoredProfileData);

export default function ProfileProvider({ children }) {
  const [profileStore, profileDispatch] = useReducer(
    profileReducerWithStorage,
    initialProfileState
  );
  // @ts-ignore
  const { markHydrated, isHydrated } = useHydration();

  useEffect(() => {
    if (!isHydrated(HydrationKeys.PROFILE)) {
      const cachedProfile = getStoredProfileData();
      const { name, avatarUrl, sessionId } = cachedProfile;
      // @ts-ignore
      profileDispatch({ type: ProfileActions.HYDRATE, payload: { name, avatarUrl, sessionId } });
      markHydrated(HydrationKeys.PROFILE);
    }
  }, [isHydrated, markHydrated]);

  const value = useMemo(() => {
    const setBasicInfo = (basicInfo) =>
      // @ts-ignore
      profileDispatch({ type: ProfileActions.SET_BASIC_INFO, payload: basicInfo });
    return { profileStore, setBasicInfo };
  }, [profileStore, profileDispatch]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

ProfileProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
