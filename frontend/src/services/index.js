import {
  login,
  socialLogin,
  logout,
  register,
  getUser,
  passwordChange,
  deleteAccount,
  verifyEmail,
} from './user';
import { syncPlayer } from './player';
import { deleteRoom } from './room';

// TODO: Move all fetchUrls into services

export {
  login as loginService,
  socialLogin as socialLoginService,
  logout as logoutService,
  register as registerService,
  getUser as getUserService,
  passwordChange as passwordChangeService,
  deleteAccount as deleteAccountService,
  verifyEmail as verifyEmailService,
  syncPlayer as syncPlayerService,
  deleteRoom as deleteRoomService,
};
