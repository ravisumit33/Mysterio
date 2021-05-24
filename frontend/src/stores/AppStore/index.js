import { makeAutoObservable } from 'mobx';

class AppStore {
  alert = {};

  shouldShowAlert = false;

  constructor() {
    makeAutoObservable(this);
  }

  setAlert = (alert) => {
    this.alert = alert;
  };

  setShouldShowAlert = (shouldShowAlert) => {
    this.shouldShowAlert = shouldShowAlert;
  };
}

const appStore = new AppStore();

export default appStore;
