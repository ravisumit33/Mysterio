import { makeAutoObservable, observable } from 'mobx';
import ChatWindowStore from 'stores/ChatWindowStore';

class AppStore {
  alert = {};

  shouldShowAlert = false;

  shouldOpenUserInfoDialog = false;

  shouldOpenLoginSignupDialog = false;

  shouldOpenNewGroupDialog = false;

  chatWindow = null;

  chatWindowData = {};

  groupRooms = [];

  groupRoomsFetched = false;

  groupCreationInProgress = false;

  constructor() {
    makeAutoObservable(this, {
      alert: observable.shallow,
    });
  }

  setAlert = (alert) => {
    this.alert = alert;
  };

  setShouldShowAlert = (shouldShowAlert) => {
    this.shouldShowAlert = shouldShowAlert;
  };

  setShouldOpenUserInfoDialog = (shouldOpenUserInfoDialog) => {
    this.shouldOpenUserInfoDialog = shouldOpenUserInfoDialog;
  };

  setShouldOpenLoginSignupDialog = (shouldOpenLoginDialog) => {
    this.shouldOpenLoginSignupDialog = shouldOpenLoginDialog;
  };

  setShouldOpenNewGroupDialog = (shouldOpenNewGroupDialog) => {
    this.shouldOpenNewGroupDialog = shouldOpenNewGroupDialog;
  };

  addChatWindow = () => {
    this.chatWindow = new ChatWindowStore(this.chatWindowData);
  };

  removeChatWIndow = () => {
    this.chatWindow.closeChatWindow();
    this.chatWindow = null;
    this.chatWindowData = {};
  };

  setGroupRooms = (groupRooms) => {
    this.groupRooms = groupRooms;
  };

  setGroupRoomsFetched = (groupRoomsFetched) => {
    this.groupRoomsFetched = groupRoomsFetched;
  };

  setGroupCreationInProgress = (groupCreationInProgress) => {
    this.groupCreationInProgress = groupCreationInProgress;
  };

  setChatWindowData = (data) => {
    this.chatWindowData = data;
  };
}

const appStore = new AppStore();

export default appStore;
