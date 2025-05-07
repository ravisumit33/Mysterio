import { useEffect } from 'react';
import incomingMessageSound from 'assets/sounds/message_pop.mp3';
import chatStartedSound from 'assets/sounds/chat_started.mp3';

const useChatSound = ({ shouldNotify, initDone }) => {
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
  }, [initDone]);
};

export default useChatSound;
