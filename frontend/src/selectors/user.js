/* eslint-disable import/prefer-default-export */
export function isLoggedIn(userStore) {
  return Boolean(userStore.email !== '');
}
