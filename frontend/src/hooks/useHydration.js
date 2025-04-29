import { useContext } from 'react';
import { HydrationContext } from 'contexts';

const useHydration = () => useContext(HydrationContext);

export default useHydration;
