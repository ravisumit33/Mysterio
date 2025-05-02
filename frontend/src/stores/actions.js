export const ProfileActions = Object.freeze({
  HYDRATE: 'PROFILE/HYDRATE',
  SET_BASIC_INFO: 'PROFILE/SET_BASIC_INFO',
});

export const UserActions = Object.freeze({
  LOGIN: 'USER/LOGIN',
  LOGOUT: 'USER/LOGOUT',
  HYDRATE: 'USER/HYDRATE',
});

export const AlertActions = Object.freeze({
  ADD: 'ALERT/ADD',
  REMOVE: 'ALERT/REMOVE',
});

export const WaitScreenActions = Object.freeze({
  SHOW: 'WAITSCREEN/SHOW',
  HIDE: 'WAITSCREEN/HIDE',
});

export const GlobalDialogActions = Object.freeze({
  OPEN: 'GLOBALDIALOG/OPEN',
  CLOSE: 'GLOBALDIALOG/CLOSE',
});

export const ChatWindowActions = Object.freeze({
  INIT: 'CHATWINDOW/INIT',
});
