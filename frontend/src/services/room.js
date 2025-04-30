import { fetchUrl } from 'utils';

/* eslint-disable import/prefer-default-export */
export const deleteRoom = (roomId, roomPwd) => {
  const fetchData = { method: 'delete' };
  if (roomPwd) {
    fetchData.headers = { 'X-Room-Password': roomPwd };
  }
  return fetchUrl(`/api/chat/rooms/${roomId}/`, fetchData);
};
