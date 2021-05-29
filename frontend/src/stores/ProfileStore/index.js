import { makeAutoObservable } from 'mobx';

class ProfileStore {
  name = '';

  avatarUrl = '';

  sessionId = '';

  username = '';

  constructor() {
    makeAutoObservable(this);
  }

  setName = (newName) => {
    this.name = newName;
  };

  setAvatarUrl = (newAvatarUrl) => {
    this.avatarUrl = newAvatarUrl;
  };

  setSessionId = (newSessionId) => {
    this.sessionId = newSessionId;
  };

  setUsername = (newUserName) => {
    this.username = newUserName;
  };

  get isLoggedIn() {
    return this.username !== '';
  }
}

const profileStore = new ProfileStore();

export default profileStore;
