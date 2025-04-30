import { HydrationContext } from 'contexts';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';

export default function HydrationProvider({ children }) {
  const [keysToHydrate, setKeysToHydrate] = useState(new Set());

  const trackHydration = useCallback(
    (key) =>
      setKeysToHydrate((prev) => {
        if (prev.has(key)) return prev;
        const updated = new Set(prev);
        updated.add(key);
        return updated;
      }),
    []
  );

  const markHydrated = useCallback(
    (key) =>
      setKeysToHydrate((prev) => {
        if (!prev.has(key)) return prev;
        const updated = new Set(prev);
        updated.delete(key);
        return updated;
      }),
    []
  );

  const value = useMemo(() => {
    const isAppReady = keysToHydrate.size === 0;
    const isHydrated = (key) => !keysToHydrate.has(key);
    return { trackHydration, markHydrated, isHydrated, isAppReady };
  }, [keysToHydrate, markHydrated, trackHydration]);

  return <HydrationContext.Provider value={value}>{children}</HydrationContext.Provider>;
}

HydrationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
