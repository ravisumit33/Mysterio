import { useHistory, useLocation } from 'react-router-dom';
import useQuery from './useQuery';

const useSearchParams = () => {
  const searchParams = useQuery();
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
