import { useCallback } from 'react';
import { useWaitScreenStore } from './useStore';

const useTaskRunnerWithLoader = () => {
  // @ts-ignore
  const { showWaitScreen, hideWaitScreen } = useWaitScreenStore();
  const run = useCallback(
    async ({ task, loaderText }) => {
      showWaitScreen(loaderText);
      try {
        return await task();
      } finally {
        hideWaitScreen();
      }
    },
    [showWaitScreen, hideWaitScreen],
  );
  return run;
};

export default useTaskRunnerWithLoader;
