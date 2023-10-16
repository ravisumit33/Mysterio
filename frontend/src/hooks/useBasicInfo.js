import { useState } from 'react';

const useBasicInfo = (initialName, initialAvatarUrl) => {
  const [name, setName] = useState(initialName || '');
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || '');

  return { name, setName, avatarUrl, setAvatarUrl };
};

export default useBasicInfo;
