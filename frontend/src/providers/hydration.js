import { HydrationContext } from 'contexts';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

export default function HydrationProvider({ children, keysToHydrate }) {
  const [hydratedKeys, setHydratedKeys] = useState(new Set());

  const markHydrated = (key) => setHydratedKeys((prev) => new Set([...prev, key]));

  const value = useMemo(() => {
    const isAppReady = keysToHydrate.every((key) => hydratedKeys.has(key));
    const isHydrated = (key) => hydratedKeys.has(key);
    return { markHydrated, isHydrated, isAppReady };
  }, [keysToHydrate, hydratedKeys]);

  return <HydrationContext.Provider value={value}>{children}</HydrationContext.Provider>;
}

HydrationProvider.propTypes = {
  children: PropTypes.node.isRequired,
  keysToHydrate: PropTypes.arrayOf(PropTypes.string),
};

HydrationProvider.defaultProps = {
  keysToHydrate: [],
};
