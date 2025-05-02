import { createDeferredPromiseObj } from 'utils';

class ProfileManager {
  constructor() {
    this.profileReadyPromise = createDeferredPromiseObj();
  }

  markReady() {
    this.profileReadyPromise.resolve();
  }

  waitUntilReady() {
    return this.profileReadyPromise.promise;
  }
}

export default ProfileManager;
