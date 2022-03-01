import { useEffect, useMemo, useState } from 'react';

const useOnScreen = (ref) => {
  const [isIntersecting, setIntersecting] = useState(false);

  const observer = useMemo(
    () => new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting)),
    []
  );

  useEffect(() => {
    ref.current && observer.observe(ref.current);
    // Remove the observer as soon as the component is unmounted
    return () => {
      observer.disconnect();
    };
  }, [observer, ref]);

  return isIntersecting;
};

export default useOnScreen;
