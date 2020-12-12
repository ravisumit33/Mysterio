import { makeAutoObservable } from 'mobx';

class ProfileStore {
  name = '';

  avatarUrl = '';

  id = '';

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
}

const profileStore = new ProfileStore();

export default profileStore;
