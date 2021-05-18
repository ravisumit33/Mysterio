import { makeAutoObservable } from 'mobx';

class UserInfoDialogStore {
  shouldOpen = false;

  chatWindowData = {};

  constructor() {
    makeAutoObservable(this);
  }

  setShouldOpen = (shouldOpen) => {
    this.shouldOpen = shouldOpen;
  };

  setChatWindowData = (chatWindowData) => {
    this.chatWindowData = chatWindowData;
  };
}

const userInfoDialogStore = new UserInfoDialogStore();

export default userInfoDialogStore;
