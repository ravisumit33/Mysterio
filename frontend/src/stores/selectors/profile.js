/* eslint-disable import/prefer-default-export */
export function isLoggedIn(profileStore) {
  return Boolean(profileStore.email !== '');
}
