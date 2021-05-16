import { makeAutoObservable } from 'mobx';
import ChatWindowStore from 'stores/ChatWindowStore';

class ChatContainerStore {
  chatWindow = null;

  chatId = 0;

  constructor() {
    makeAutoObservable(this);
  }

  addChatWindow = (roomId) => {
    this.chatWindow = {
      id: this.chatId,
      store: new ChatWindowStore(roomId),
    };
    this.chatId += 1;
  };

  removeChatWIndow = (id) => {
    this.chatWindow.store.closeChatWindow();
    this.chatWindow = null;
  };
}

const chatContainerStore = new ChatContainerStore();

export default chatContainerStore;
