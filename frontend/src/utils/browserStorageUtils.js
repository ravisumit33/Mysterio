import { BrowserStorageKeys, BrowserStorageKeysPrefix } from 'appConstants';

const getValue = (key, defaultValue = null) => {
  let val = defaultValue;
  try {
    const storedData = window.localStorage.getItem(`${BrowserStorageKeysPrefix}${key}`);
    if (storedData) {
      val = JSON.parse(storedData);
    }
  } catch {
    // If user is in private mode or has storage restriction localStorage can throw.
    // Or data that is saved has been corrupted
    window.localStorage.removeItem(`${BrowserStorageKeysPrefix}${key}`);
  }
  return val;
};

const setValue = (key, value) => {
  try {
    window.localStorage.setItem(`${BrowserStorageKeysPrefix}${key}`, JSON.stringify(value));
  } catch {
    // If user is in private mode or has storage restriction
    // localStorage can throw.
  }
};

const getStoredProfileData = () => {
  const storageKey = BrowserStorageKeys.profileData;
  return getValue(storageKey, {});
};

const updateStoredProfileData = (updateFields) => {
  const storageKey = BrowserStorageKeys.profileData;
  const profileData = getValue(storageKey, {});
  Object.assign(profileData, updateFields);
  setValue(storageKey, profileData);
};

const getStoredChatWindowData = (roomType, roomId) => {
  const storageKey = BrowserStorageKeys.chatWindowData;
  const chatWindowData = getValue(storageKey, {});
  return chatWindowData[roomType]?.[roomId] || {};
};

const updateStoredChatWindowData = (roomType, roomId, updateFields) => {
  const storageKey = BrowserStorageKeys.chatWindowData;
  const chatWindowData = getValue(storageKey, {});
  if (!chatWindowData[roomType]) {
    chatWindowData[roomType] = {};
  }
  if (!chatWindowData[roomType][roomId]) {
    chatWindowData[roomType][roomId] = {};
  }
  Object.assign(chatWindowData[roomType][roomId], updateFields);
  setValue(storageKey, chatWindowData);
};

const deleteStoredChatWindowData = (roomType, roomId) => {
  const storageKey = BrowserStorageKeys.chatWindowData;
  const chatWindowData = getValue(storageKey, {});
  if (chatWindowData[roomType] && chatWindowData[roomType][roomId]) {
    delete chatWindowData[roomType][roomId];
    setValue(storageKey, chatWindowData);
  }
};

export {
  getValue as getValueFromBrowserStorage,
  setValue as setValueInBrowserStorage,
  getStoredChatWindowData,
  updateStoredChatWindowData,
  deleteStoredChatWindowData,
  getStoredProfileData,
  updateStoredProfileData,
};
