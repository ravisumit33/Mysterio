import { useRef, useCallback, useEffect } from 'react';

function useManagerContext({ stores, actions }) {
  const getContext = useCallback(() => ({ stores, actions }), [stores, actions]);
  return getContext;
}

export default useManagerContext;
