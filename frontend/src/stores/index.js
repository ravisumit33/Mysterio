import ChatContainerStore from './chatContainerStore';
import ProfileStore from './profileStore';

const chatContainerStore = new ChatContainerStore();
const profileStore = new ProfileStore();

const initStores = (stores) => {
  chatContainerStore.initStore(stores);
  profileStore.initStore(stores);
};

export { chatContainerStore, profileStore, initStores };
