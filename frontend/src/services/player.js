import { fetchUrl } from 'utils';

/* eslint-disable import/prefer-default-export */
export const syncPlayer = (roomId, roomPwd) => {
  const fetchData = {};
  if (roomPwd) {
    fetchData.headers = { 'X-Room-Password': roomPwd };
  }
  return fetchUrl(`/api/chat/players/?search=${roomId}`, fetchData);
};
