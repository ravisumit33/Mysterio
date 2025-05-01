import { fetchUrl } from 'utils';

const withRoomPassword = (options, roomPwd) => {
  const headers = { ...(options.headers || {}) };
  if (roomPwd) {
    headers['X-Room-Password'] = roomPwd;
  }
  return { ...options, headers };
};

export const deleteRoom = (roomId, roomPwd) => {
  const options = withRoomPassword({ method: 'DELETE' }, roomPwd);
  return fetchUrl(`/api/chat/rooms/${roomId}/`, options);
};

export const createRoom = (roomType, roomData) => {
  const { name, description, password, avatarUrl } = roomData;
  return fetchUrl('/api/chat/rooms/', {
    method: 'post',
    body: {
      room_type: roomType,
      room_data: { name, description, password, avatar_url: avatarUrl },
    },
  });
};

export const getRoom = (roomId, roomPwd) => {
  const options = withRoomPassword({ method: 'GET' }, roomPwd);
  return fetchUrl(`/api/chat/rooms/${roomId}`, options);
};

export const updateRoom = (roomId, roomPwd, updateData) => {
  const options = withRoomPassword({ method: 'PATCH' }, roomPwd);
  options.body = updateData;
  return fetchUrl(`/api/chat/rooms/${roomId}`, options);
};

export const getRoomProtection = (roomId) => fetchUrl(`/api/chat/rooms/${roomId}/is_protected`);

export const verifyRoomPassword = (roomId, roomPwd) => {
  const options = withRoomPassword({ method: 'GET' }, roomPwd);
  return fetchUrl(`/api/chat/rooms/${roomId}/check_password/`, options);
};

export const getInitialMessagePage = (roomId, roomPwd) => {
  const options = withRoomPassword({ method: 'GET' }, roomPwd);
  return fetchUrl(`/api/chat/messages/?search=${roomId}&page_size=250&ordering=-sent_at`, options);
};

export const getPreviousMessagePage = (previousPageUrl, roomPwd) => {
  const options = withRoomPassword({ method: 'GET' }, roomPwd);
  return fetchUrl(previousPageUrl, options);
};
