import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { useState } from 'react';
import { useAsync } from 'react-async-hook';
import useConstant from './useConstant';

const useDebouncedSearch = (searchFunc) => {
  const [inputText, setInputText] = useState('');
  const debouncedSearchFunc = useConstant(() => AwesomeDebouncePromise(searchFunc, 500));
  const searchResults = useAsync(async () => {
    if (inputText) {
      return debouncedSearchFunc(inputText);
    }
    return [];
  }, [debouncedSearchFunc, inputText]);

  return {
    inputText,
    setInputText,
    searchResults,
  };
};

export default useDebouncedSearch;
