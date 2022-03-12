import log from 'loglevel';
import { createSyncedMap } from 'utils';

class Cryptor {
  keyPair = null;

  pairwiseSecretKeys = createSyncedMap();

  secretKeysOfConnections = createSyncedMap();

  secretKey = null;

  static secretKeyConfig = [
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  ];

  static dhKeyPairConfig = [
    {
      name: 'ECDH',
      namedCurve: 'P-384',
    },
    true,
    ['deriveKey'],
  ];

  static importKey = (keyJson, config) =>
    // @ts-ignore
    window.crypto.subtle.importKey('jwk', keyJson, ...config);

  static exportKey = (key) => window.crypto.subtle.exportKey('jwk', key);

  generateSecretKey = async () => {
    // @ts-ignore
    this.secretKey = await window.crypto.subtle.generateKey(...Cryptor.secretKeyConfig);
  };

  getSecretKey = async () => {
    if (!this.secretKey) await this.generateSecretKey();
    return this.secretKey;
  };

  generateKeyPair = async () => {
    // @ts-ignore
    this.keyPair = await window.crypto.subtle.generateKey(...Cryptor.dhKeyPairConfig);
  };

  getKeyPair = async () => {
    if (!this.keyPair) await this.generateKeyPair();
    return this.keyPair;
  };

  derivePairwiseSecretKey = async (newUserId, newUserPubKeyStr) => {
    const newUserPubKeyJson = JSON.parse(newUserPubKeyStr);
    const pubKeyConfig = [...Cryptor.dhKeyPairConfig];
    pubKeyConfig[2] = []; // Public keys has no key usages
    const newUserPubKey = await Cryptor.importKey(newUserPubKeyJson, pubKeyConfig);

    const ownKeyPair = await this.getKeyPair();
    const newUserPairWiseSecretKey = await window.crypto.subtle.deriveKey(
      {
        name: 'ECDH',
        public: newUserPubKey,
      },
      ownKeyPair.privateKey,
      // @ts-ignore
      ...Cryptor.secretKeyConfig
    );

    this.pairwiseSecretKeys.set(newUserId, newUserPairWiseSecretKey);
  };

  getPairwiseSecretKey = async (userId) => {
    const pairWiseSecretKey = await this.pairwiseSecretKeys.get(userId);
    return pairWiseSecretKey;
  };

  getSecretKeyForUser = async (userId) => {
    const secretKey = await this.secretKeysOfConnections.get(userId);
    return secretKey;
  };

  setSecretKeyForUser = (userId, key) => this.secretKeysOfConnections.set(userId, key);

  static encryptText = async (text, key) => {
    const encoder = new TextEncoder();
    const encodedMsg = encoder.encode(text);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ivStr = Array.from(iv)
      .map((b) => String.fromCharCode(b))
      .join('');
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encodedMsg
    );
    const ctArray = Array.from(new Uint8Array(ciphertext));
    const ctStr = ctArray.map((byte) => String.fromCharCode(byte)).join('');
    const ret = window.btoa(ivStr + ctStr);
    return ret;
  };

  static decryptText = async (text, key) => {
    let decryptedText;
    try {
      const base64DecodedText = window.atob(text);
      const ivStr = base64DecodedText.slice(0, 12);
      const iv = new Uint8Array(Array.from(ivStr).map((ch) => ch.charCodeAt(0)));
      const ctStr = base64DecodedText.slice(12);
      const buff = new Uint8Array(Array.from(ctStr).map((ch) => ch.charCodeAt(0)));
      decryptedText = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        key,
        buff
      );
    } catch (e) {
      log.error('Error in decrypting');
      log.error(e);
      return '';
    }
    const decoder = new TextDecoder();
    const ret = decoder.decode(decryptedText);
    return ret;
  };
}

export default Cryptor;
