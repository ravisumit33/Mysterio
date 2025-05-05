import React, { useMemo, useEffect, useReducer, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { ProfileContext } from 'contexts';
import { profileReducer, initialProfileState, ProfileActions } from 'stores';
import { getStoredProfileData, updateStoredProfileData } from 'utils/browserStorageUtils';
import { useHydration } from 'hooks';
import { HydrationKeys } from 'appConstants';
import { ProfileManager } from 'managers';
import withStorage from './withStorage';

const profileReducerWithStorage = withStorage(profileReducer, updateStoredProfileData);

export default function ProfileProvider({ children }) {
  const [profileStore, profileDispatch] = useReducer(
    profileReducerWithStorage,
    initialProfileState
  );
  // @ts-ignore
  const { trackHydration, markHydrated, isHydrated } = useHydration();
  const profileManagerRef = useRef(new ProfileManager());

  useEffect(() => trackHydration(HydrationKeys.PROFILE), [trackHydration]);

  useEffect(() => {
    if (!isHydrated(HydrationKeys.PROFILE)) {
      const cachedProfile = getStoredProfileData();
      const { name, avatarUrl, sessionId } = cachedProfile;
      // @ts-ignore
      profileDispatch({ type: ProfileActions.HYDRATED, payload: { name, avatarUrl, sessionId } });
      markHydrated(HydrationKeys.PROFILE);
    }
  }, [isHydrated, markHydrated]);

  useEffect(() => {
    if (profileStore.isReady) {
      profileManagerRef.current.markReady();
    }
  }, [profileStore.isReady]);

  const setBasicInfo = useCallback(
    // @ts-ignore
    (basicInfo) => profileDispatch({ type: ProfileActions.BASIC_INFO_UPDATED, payload: basicInfo }),
    []
  );

  const waitUntilReady = useCallback(() => profileManagerRef.current.waitUntilReady(), []);

  const value = useMemo(
    () => ({ profileStore, setBasicInfo, waitUntilReady }),
    [profileStore, setBasicInfo, waitUntilReady]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

ProfileProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
