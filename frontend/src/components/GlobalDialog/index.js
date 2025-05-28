import { GlobalDialogTypes } from 'appConstants';
import { useGlobalDialogStore } from 'hooks/useStore';
import React, { useCallback, useMemo } from 'react';
import UserInfoDialog from './UserInfoDialog';
import RoomPasswordDialog from './RoomPasswordDialog';

function GlobalDialog() {
  // @ts-ignore
  const { dialogStore, closeGlobalDialog } = useGlobalDialogStore();

  const handleSuccess = useCallback(
    (...args) => {
      dialogStore.payload?.onSuccess?.(...args);
      closeGlobalDialog();
    },
    [dialogStore.payload, closeGlobalDialog],
  );

  const handleCancel = useCallback(
    (...args) => {
      dialogStore.payload?.onCancel?.(...args);
      closeGlobalDialog();
    },
    [dialogStore.payload, closeGlobalDialog],
  );

  const dialogPayload = useMemo(
    () => ({
      ...dialogStore.payload,
      onSuccess: handleSuccess,
      onCancel: handleCancel,
    }),
    [dialogStore.payload, handleSuccess, handleCancel],
  );

  if (!dialogStore.isOpen) return null;

  switch (dialogStore.type) {
    case GlobalDialogTypes.USER_INFO:
      return <UserInfoDialog payload={dialogPayload} />;
    case GlobalDialogTypes.ROOM_PASSWORD:
      return <RoomPasswordDialog payload={dialogPayload} />;
    default:
      return null;
  }
}

export default GlobalDialog;
