import { useCallback } from 'react';
import { useWaitScreenStore } from './useStore';

const useAsyncRunnerWithLoader = () => {
  // @ts-ignore
  const { showWaitScreen, hideWaitScreen } = useWaitScreenStore();
  const run = useCallback(
    async ({ task, loadScreenText }) => {
      showWaitScreen(loadScreenText);
      try {
        return await task();
      } finally {
        hideWaitScreen();
      }
    },
    [showWaitScreen, hideWaitScreen]
  );
  return run;
};

export default useAsyncRunnerWithLoader;
