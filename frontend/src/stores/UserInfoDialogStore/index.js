import { makeAutoObservable } from 'mobx';

class UserInfoDialogStore {
  shouldOpen = false;

  roomId = undefined;

  constructor() {
    makeAutoObservable(this);
  }

  setShouldOpen = (shouldOpen) => {
    this.shouldOpen = shouldOpen;
  };

  setRoomId = (roomId) => {
    this.roomId = roomId;
  };
}

const userInfoDialogStore = new UserInfoDialogStore();

export default userInfoDialogStore;
