import { makeAutoObservable } from 'mobx';

class ProfileStore {
  name = '';

  avatarUrl = '';

  constructor() {
    makeAutoObservable(this);
  }

  setName(newName) {
    this.name = newName;
  }

  setAvatarUrl(newAvatarUrl) {
    this.avatarUrl = newAvatarUrl;
  }
}

const profileStore = new ProfileStore();

export default profileStore;
