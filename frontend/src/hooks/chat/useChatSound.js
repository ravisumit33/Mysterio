import { useEffect } from 'react';

const useChatSound = ({ incomingMessageSound, chatStartedSound, shouldNotify, initDone }) => {
  useEffect(() => {
    const incomingMessageAudio = new Audio(incomingMessageSound);
    if (shouldNotify) {
      incomingMessageAudio.play();
    }
  });
  useEffect(() => {
    if (initDone) {
      const chatStartedAudio = new Audio(chatStartedSound);
      chatStartedAudio.play();
    }
  }, [chatStartedSound, initDone]);
};

export default useChatSound;
