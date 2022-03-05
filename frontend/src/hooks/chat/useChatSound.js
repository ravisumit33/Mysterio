import { useEffect } from 'react';

const useChatSound = ({ incomingMessageSound, chatStartedSound, shouldNotify, initDone }) => {
  useEffect(() => {
    if (shouldNotify) {
      const incomingMessageAudio = new Audio(incomingMessageSound);
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
