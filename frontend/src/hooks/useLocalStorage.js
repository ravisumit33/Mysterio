import { getValueFromBrowserStorage, setValueInBrowserStorage } from 'utils/browserStorageUtils';

const useLocalStorage = (key, defaultValue = null) => {
  const setValue = (value) => {
    setValueInBrowserStorage(key, value);
  };

  return [getValueFromBrowserStorage(key, defaultValue), setValue];
};

export default useLocalStorage;
