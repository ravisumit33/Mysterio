import log from 'loglevel';

class Encrption {
  keyPair = null;

  pairWiseSecretKeys = new Map();

  secretKey = null;

  iv = null;

  constructor() {
    this.iv = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  }

  checkOrGenerateSecretKey = async () => {
    if (!this.secretKey) await this.generateSecretKey();
  };

  generateSecretKey = async () => {
    this.secretKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  };

  generateKeyPair = async () => {
    this.keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-384',
      },
      true,
      ['deriveKey']
    );
  };

  derivePairwiseSecretKey = async (newUserId, newUserPubKeyStr) => {
    const newUserPubKeyJson = JSON.parse(newUserPubKeyStr);
    const newUserPubKey = await window.crypto.subtle.importKey(
      'jwk',
      newUserPubKeyJson,
      {
        name: 'ECDH',
        namedCurve: 'P-384',
      },
      true,
      []
    );

    const newUserPairWiseSecretKey = await window.crypto.subtle.deriveKey(
      {
        name: 'ECDH',
        public: newUserPubKey,
      },
      this.keyPair.privateKey,
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );

    this.pairWiseSecretKeys.set(newUserId, newUserPairWiseSecretKey);
  };

  encryptTextMsg = async (textMsg, key) => {
    const encoder = new TextEncoder();
    const encodedMsg = encoder.encode(textMsg);
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: this.iv,
      },
      key,
      encodedMsg
    );
    const ctArray = Array.from(new Uint8Array(ciphertext)); // ciphertext as byte array
    const ctStr = ctArray.map((byte) => String.fromCharCode(byte)).join(''); // ciphertext as string
    console.log(ciphertext);
    return btoa(ctStr);
  };

  decryptTextMsg = async (encodedTextMsg, key) => {
    console.log(encodedTextMsg);
    let decryptedTextMsg;
    try {
      const ctStr = atob(encodedTextMsg); // decode base64 ciphertext
      const buff = new Uint8Array(Array.from(ctStr).map((ch) => ch.charCodeAt(0)));
      console.log(buff);
      decryptedTextMsg = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: this.iv,
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
    return decoder.decode(decryptedTextMsg);
  };
}

export default Encrption;
