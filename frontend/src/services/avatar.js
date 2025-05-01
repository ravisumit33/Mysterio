import { fetchUrl } from 'utils';

// eslint-disable-next-line import/prefer-default-export
export const uploadAvatar = (avatarBlobUrl) => {
  const formData = new FormData();
  formData.append('file', avatarBlobUrl);
  return fetchUrl('/api/upload_avatar/', {
    method: 'post',
    body: formData,
    header: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
