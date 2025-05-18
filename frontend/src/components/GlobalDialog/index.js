import { GlobalDialogTypes } from 'appConstants';
import { useGlobalDialogStore } from 'hooks/useStore';
import React from 'react';
import UserInfoDialog from './UserInfoDialog';
import RoomPasswordDialog from './RoomPasswordDialog';

function GlobalDialog() {
  // @ts-ignore
  const { dialogStore } = useGlobalDialogStore();

  if (!dialogStore.isOpen) return null;

  switch (dialogStore.type) {
    case GlobalDialogTypes.USER_INFO:
      return <UserInfoDialog payload={dialogStore.payload} />;
    case GlobalDialogTypes.ROOM_PASSWORD:
      return <RoomPasswordDialog payload={dialogStore.payload} />;
    default:
      return null;
  }
}

export default GlobalDialog;
