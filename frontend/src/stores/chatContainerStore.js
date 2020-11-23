import log from 'loglevel';
import { action, makeObservable, observable } from 'mobx';

class CharContainerStore {
  chatWindows = [];

  chatId = 0;

  constructor() {
    makeObservable(this, {
      chatWindows: observable.shallow,
      chatId: observable,
      addChatWindow: action.bound,
      removeChatWIndow: action.bound,
    });
    this.initState();
  }

  initState() {
    this.chatWindows = [];
    this.chatId = 0;
  }

  addChatWindow(roomId) {
    log.warn('add new chat window', roomId);
    this.chatWindows.push({ id: this.chatId, roomId });
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
