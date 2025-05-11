import { useRef, useCallback } from 'react';
import { useAlertStore } from './useStore';

const useTaskRunnerWithAlert = () => {
  // @ts-ignore
  const { showAlert, hideAlert } = useAlertStore();
  const errorAlertIdRef = useRef(null);
  const run = useCallback(
    async ({ task, onSuccessCb, onErrorCb, onCompletionCb = () => {} }) => {
      try {
        const result = await task();
        if (errorAlertIdRef.current) {
          // we need to hide error alert (if any) on success
          // This is needed to remove the error alert in cases where no success alerts are shown,
          // Although alerts gets auto dismissed after a timeout, quick removal of stale alerts is necessary for better UX
          hideAlert(errorAlertIdRef.current);
          errorAlertIdRef.current = null;
        }
        return await onSuccessCb(result, showAlert);
      } catch (err) {
        const showErrorAlertCb = (alert) => {
          errorAlertIdRef.current = showAlert(alert);
        };
        // https://stackoverflow.com/a/44806230/6842304
        // eslint-disable-next-line no-return-await
        return await onErrorCb(err, showErrorAlertCb);
      } finally {
        onCompletionCb();
      }
    },
    [showAlert, hideAlert],
  );
  return run;
};

export default useTaskRunnerWithAlert;
