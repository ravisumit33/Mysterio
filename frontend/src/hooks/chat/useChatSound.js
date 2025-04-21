import { useEffect } from 'react';

const useChatSound = ({ incomingMessageSound, chatStartedSound, shouldNotify, initDone }) => {
  useEffect(() => {
    if (shouldNotify) {
      const incomingMessageAudio = new Audio(incomingMessageSound);
      try {
        incomingMessageAudio.play();
      } catch (e) {
        // This throws when the message is played before user has done any interaction
      }
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
