import { makeAutoObservable } from 'mobx';

class ProfileStore {
  name = '';

  avatarUrl = '';

  sessionId = '';

  email = '';

  profileInitialized = false;

  social = false;

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

  setProfileInitialized = (newProfileInitialized) => {
    this.profileInitialized = newProfileInitialized;
  };

  setEmail = (newEmail) => {
    this.email = newEmail;
  };

  setSocial = (newSocial) => {
    this.social = newSocial;
  };

  get isLoggedIn() {
    return this.email !== '';
  }

  get username() {
    return this.email.split('@')[0];
  }

  get hasCompleteUserInfo() {
    return this.name !== '';
  }
}

const profileStore = new ProfileStore();

export default profileStore;
