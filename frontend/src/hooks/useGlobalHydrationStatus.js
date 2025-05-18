import { useContext } from 'react';
import { GlobalHydrationStatusContext } from 'contexts';

const useGlobalHydrationStatus = () => useContext(GlobalHydrationStatusContext);

export default useGlobalHydrationStatus;
