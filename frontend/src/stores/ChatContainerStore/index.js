import { makeAutoObservable, observable } from 'mobx';
import ChatWindowStore from 'stores/ChatWindowStore';

class ChatContainerStore {
  chatWindows = [];

  chatId = 0;

  individualChatExist = false;

  constructor() {
    makeAutoObservable(this, { chatWindows: observable.shallow });
  }

  setIndividualChatExist = (value) => {
    this.individualChatExist = value;
  };

  addChatWindow = (roomId) => {
    this.chatWindows.push({
      id: this.chatId,
      store: new ChatWindowStore(roomId),
    });
    if (!this.chatWindows[this.chatWindows.length - 1].store.isGroupChat) {
      this.setIndividualChatExist(true);
    }
    this.chatId += 1;
  };

  removeChatWIndow = (id) => {
    const chatWindowIdx = this.chatWindows.findIndex((item) => item.id === id);
    !this.chatWindows[chatWindowIdx].store.isGroupChat && this.setIndividualChatExist(false);
    this.chatWindows[chatWindowIdx].store.closeChatWindow();
    this.chatWindows.splice(chatWindowIdx, 1);
  };

  get isAnyWindowMinimized() {
    return this.chatWindows.some((chatWindow) => chatWindow.store.isWindowMinimized);
  }
}

const chatContainerStore = new ChatContainerStore();

export default chatContainerStore;
