import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { useRef, useState } from 'react';
import { useAsync } from 'react-async-hook';

const useConstant = (getConstantFunc) => {
  const ref = useRef(null);
  if (!ref.current) {
    ref.current = { val: getConstantFunc() };
  }
  return ref.current.val;
};

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

const useAudio = (sound) =>
  useConstant(() => {
    const audio = new Audio(sound);
    return audio;
  });

export { useDebouncedSearch, useConstant, useAudio };
