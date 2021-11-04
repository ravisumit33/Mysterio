import { makeAutoObservable, observable } from 'mobx';
import ChatWindowStore from 'stores/ChatWindowStore';
import { fetchUrl } from 'utils';

class AppStore {
  alert = {};

  shouldShowAlert = false;

  shouldOpenUserInfoDialog = false;

  shouldOpenNewGroupDialog = false;

  shouldOpenAccountsDrawer = false;

  chatWindow = null;

  chatWindowData = {};

  groupRooms = [];

  groupRoomsFetched = false;

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

  showAlert = (newAlert) => {
    this.setShouldShowAlert(false);
    this.setAlert(newAlert);
    this.setShouldShowAlert(true);
  };

  setShouldOpenUserInfoDialog = (shouldOpenUserInfoDialog) => {
    this.shouldOpenUserInfoDialog = shouldOpenUserInfoDialog;
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

  setShouldOpenAccountsDrawer = (shouldOpenAccountsDrawer) => {
    this.shouldOpenAccountsDrawer = shouldOpenAccountsDrawer;
  };

  setChatWindowData = (data) => {
    this.chatWindowData = data;
  };

  updateGroupRooms = () =>
    fetchUrl('/api/chat/groups/')
      .then((response) => {
        this.setGroupRooms(Object.values(response.data));
      })
      .catch(() => {});
}

const appStore = new AppStore();

export default appStore;
