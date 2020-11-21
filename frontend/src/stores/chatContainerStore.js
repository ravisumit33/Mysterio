import { observable, action } from 'mobx';

const PREFIX = '[store/chatContainerStore]';
const DEBUG = true;

class CharContainerStore {
  @observable.shallow chatWindows = [];

  @observable chatId = 0;

  @action.bound
  addChatWindow(type) {
    if (DEBUG) console.log(PREFIX, 'action addChatWindow', type);
    this.chatWindows.push(this.chatId);
    this.chatId += 1;
  }

  @action
  removeChatWIndow(id) {
    if (DEBUG) console.log(PREFIX, 'action removeChatWindow', id);
    const chatWindowIdx = this.chatWindows.indexOf(id);
    if (chatWindowIdx !== -1) {
      this.chatWindows.splice(chatWindowIdx, 1);
    }
  }
}

export default CharContainerStore;
