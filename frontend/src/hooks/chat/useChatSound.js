import { useEffect } from 'react';

const useChatSound = ({ incomingMessageSound, chatStartedSound, shouldNotify, initDone }) => {
  useEffect(() => {
    if (shouldNotify) {
      const incomingMessageAudio = new Audio(incomingMessageSound);
      incomingMessageAudio.play().catch(() => {});
    }
  });
  useEffect(() => {
    if (initDone) {
      const chatStartedAudio = new Audio(chatStartedSound);
      // This rejects when the message is played before user has done any interaction
      chatStartedAudio.play().catch(() => {});
    }
  }, [chatStartedSound, initDone]);
};

export default useChatSound;
