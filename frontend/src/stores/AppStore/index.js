import { makeAutoObservable, observable } from 'mobx';
import ChatWindowStore from 'stores/ChatWindowStore';
import { fetchUrl } from 'utils';

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
    this.chatWindow = new ChatWindowStore({ appStore: this, data: this.chatWindowData });
  };

  removeChatWIndow = () => {
    this.chatWindow.isGroupChat && this.updateGroupRooms();
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

  updateGroupRooms = () =>
    fetchUrl('/api/chat/groups/').then((response) => {
      this.setGroupRooms(Object.values(response.data));
    });
}

const appStore = new AppStore();

export default appStore;
