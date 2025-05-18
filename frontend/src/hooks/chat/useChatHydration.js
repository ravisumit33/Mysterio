import { useContext } from 'react';
import { ChatHydrationContext } from 'contexts';

const useChatHydration = () => useContext(ChatHydrationContext);

export default useChatHydration;
