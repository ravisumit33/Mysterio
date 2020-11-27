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

export default ProfileStore;
