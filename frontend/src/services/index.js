import {
  login,
  socialLogin,
  logout,
  register,
  getUser,
  passwordChange,
  forgotPassword,
  resetPassword,
  deleteAccount,
  verifyEmail,
} from './user';
import { syncPlayer } from './player';
import {
  deleteRoom,
  createRoom,
  getRoom,
  updateRoom,
  verifyRoomPassword,
  getRoomProtection,
  getInitialMessagePage,
  getPreviousMessagePage,
} from './room';
import { uploadAvatar } from './avatar';

// TODO: Move all fetchUrls into services

export {
  login as loginService,
  socialLogin as socialLoginService,
  logout as logoutService,
  register as registerService,
  getUser as getUserService,
  passwordChange as passwordChangeService,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  deleteAccount as deleteAccountService,
  verifyEmail as verifyEmailService,
  syncPlayer as syncPlayerService,
  deleteRoom as deleteRoomService,
  createRoom as createRoomService,
  getRoom as getRoomService,
  updateRoom as updateRoomService,
  verifyRoomPassword as verifyRoomPasswordService,
  getRoomProtection as getRoomProtectionService,
  getInitialMessagePage as getInitialMessagePageService,
  getPreviousMessagePage as getPreviousMessagePageService,
  uploadAvatar as uploadAvatarService,
};
