import { createDeferredPromiseObj } from 'utils';

class ProfileManager {
  constructor() {
    this.profileReadyPromise = createDeferredPromiseObj();
    this.ready = false;
  }

  get isReady() {
    return this.ready;
  }

  markReady() {
    this.profileReadyPromise.resolve();
  }

  waitUntilReady() {
    return this.profileReadyPromise.promise;
  }
}

const profileManager = new ProfileManager();
export default profileManager;
