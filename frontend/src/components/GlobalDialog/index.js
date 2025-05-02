import { useGlobalDialogStore } from 'hooks/useStore';
import React from 'react';
import UserInfoDialog from './UserInfoDialog';

function GlobalDialog() {
  // @ts-ignore
  const { dialogStore } = useGlobalDialogStore();

  if (!dialogStore.isOpen) return null;

  switch (dialogStore.type) {
    case 'userInfo':
      return <UserInfoDialog payload={dialogStore.payload} />;
    default:
      return null;
  }
}

export default GlobalDialog;
