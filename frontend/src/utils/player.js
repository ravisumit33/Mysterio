import { PlayerName } from 'appConstants';

const getVideoIdFromUrl = (url, player) => {
  let videoId;
  try {
    const urlObj = new URL(url);
    switch (player) {
      case PlayerName.YOUTUBE: {
        if (urlObj.hostname === 'youtu.be') {
          const { pathname } = urlObj;
          videoId = pathname.substr(pathname.indexOf('/') + 1);
        } else if (urlObj.hostname === 'www.youtube.com') {
          videoId = urlObj.searchParams.get('v');
        }
        break;
      }
      default:
        break;
    }
    return videoId;
  } catch {
    return videoId;
  }
};

// eslint-disable-next-line import/prefer-default-export
export { getVideoIdFromUrl };
