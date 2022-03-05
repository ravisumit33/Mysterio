import { makeAutoObservable, observable } from 'mobx';
import ChatWindowStore from 'stores/ChatWindowStore';
import { fetchUrl } from 'utils';

class AppStore {
  alert = {};

  shouldShowAlert = false;

  shouldOpenNewGroupDialog = false;

  shouldOpenAccountsDrawer = false;

  shouldShowWaitScreen = false;

  waitScreenText = '';

  chatWindow = null;

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

  setShouldOpenNewGroupDialog = (shouldOpenNewGroupDialog) => {
    this.shouldOpenNewGroupDialog = shouldOpenNewGroupDialog;
  };

  setShouldShowWaitScreen = (shouldShowWaitScreen) => {
    this.shouldShowWaitScreen = shouldShowWaitScreen;
  };

  setWaitScreenText = (waitScreenText) => {
    this.waitScreenText = waitScreenText;
  };

  showWaitScreen = (waitScreenText) => {
    this.setShouldShowWaitScreen(false);
    this.setWaitScreenText(waitScreenText);
    this.setShouldShowWaitScreen(true);
  };

  addChatWindow = (chatWindowData) => {
    this.chatWindow = new ChatWindowStore({ appStore: this, data: chatWindowData });
  };

  removeChatWindow = () => {
    if (!this.chatWindow) return;
    this.chatWindow.isGroupChat && this.updateGroupRooms();
    this.chatWindow.closeChatWindow();
    this.chatWindow = null;
    this.chatWindowData = {};
  };

  reconnect = () => {
    this.removeChatWindow();
    this.addChatWindow();
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

  updateGroupRooms = () =>
    fetchUrl('/api/chat/group_rooms/')
      .then((response) => {
        this.setGroupRooms(Object.values(response.data));
      })
      .catch(() => {});
}

const appStore = new AppStore();

export default appStore;
