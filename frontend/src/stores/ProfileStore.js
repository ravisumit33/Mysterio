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
    this.userInfoCompletedPromise = new Promise((resolve) => {
      this.userInfoCompletedPromiseResolve = resolve;
    });
  }

  setName = (newName) => {
    this.name = newName;
  };

  setAvatarUrl = (newAvatarUrl) => {
    this.avatarUrl = newAvatarUrl;
  };

  setSessionId = (newSessionId) => {
    this.sessionId = newSessionId;
    this.userInfoCompletedPromiseResolve();
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
    return this.name !== '' && this.avatarUrl !== '';
  }
}

const profileStore = new ProfileStore();

export default profileStore;
