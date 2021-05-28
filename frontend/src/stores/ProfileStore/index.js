import { makeAutoObservable } from 'mobx';

class ProfileStore {
  name = '';

  avatarUrl = '';

  id = '';

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

  setId = (newId) => {
    this.id = newId;
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
