import { useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

const useSearchParams = () => {
  const { search } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const history = useHistory();
  const { pathname } = useLocation();
  const setSearchParams = (newSearchParams) => {
    history.replace({
      pathname,
      search: newSearchParams.toString(),
    });
  };
  return [searchParams, setSearchParams];
};

export default useSearchParams;
