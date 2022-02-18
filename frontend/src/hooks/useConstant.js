import { useRef } from 'react';

const useConstant = (getConstantFunc) => {
  const ref = useRef(null);
  if (!ref.current) {
    ref.current = { val: getConstantFunc() };
  }
  return ref.current.val;
};

export default useConstant;
