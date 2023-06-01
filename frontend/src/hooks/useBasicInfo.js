import { useRef, useState } from 'react';

const useBasicInfo = (initialName, initialAvatarUrl) => {
  const [name, setName] = useState(initialName || '');
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || '');
  const uploadedAvatarRef = useRef(null);

  const setUploadedAvatar = (avatar) => {
    uploadedAvatarRef.current = avatar;
  };

  const getUploadedAvatar = () => uploadedAvatarRef.current;

  return { name, setName, avatarUrl, setAvatarUrl, getUploadedAvatar, setUploadedAvatar };
};

export default useBasicInfo;
