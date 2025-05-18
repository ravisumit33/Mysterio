class BaseManager {
  constructor(getCtx) {
    this.getCtx = getCtx;
  }

  get stores() {
    return this.getCtx().stores;
  }

  get actions() {
    return this.getCtx().actions;
  }
}

export default BaseManager;
