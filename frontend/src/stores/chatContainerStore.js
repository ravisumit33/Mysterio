import log from 'loglevel';
import { action, makeObservable, observable } from 'mobx';
import ChatWindowStore from './chatWindowStore';

class CharContainerStore {
  chatWindows = {};

  chatId = 0;

  individualChatExist = false;

  constructor() {
    makeObservable(this, {
      chatWindows: observable.shallow,
      chatId: observable,
      addChatWindow: action.bound,
      removeChatWIndow: action.bound,
      individualChatExist: observable,
      setIndividualChatExist: action.bound,
    });
    this.initState();
  }

  initState() {
    this.chatWindows = [];
    this.chatId = 0;
  }

  initStore(stores) {
    this.stores = stores;
  }

  setIndividualChatExist(value = false) {
    this.individualChatExist = value;
  }

  addChatWindow(roomId) {
    log.warn('add new chat window', roomId);
    this.chatWindows[this.chatId] = {
      id: this.chatId,
      store: new ChatWindowStore(roomId, this.stores),
    };
    this.chatId += 1;
  }

  removeChatWIndow(id) {
    const chatWindowIdx = this.chatWindows.findIndex((item) => item.id === id);
    if (chatWindowIdx !== -1) {
      this.chatWindows.splice(chatWindowIdx, 1);
    }
  }
}

export default CharContainerStore;
