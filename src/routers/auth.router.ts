import { Router } from "express";

import { authController } from "../controllers/auth.controller";
import { ActionTokenTypeEnum } from "../enums/action-token-type.enum";
import { authMiddleware } from "../middlewares/auth.middleware";
import { commonMiddleware } from "../middlewares/common.middleware";
import { UserValidator } from "../validators/user.validator";

const router = Router();

// region POST
router.get("/ping", authMiddleware.checkRefreshToken, authController.ping);

router.post(
  "/sign-up",
  commonMiddleware.validateBody(UserValidator.signUp),
  authMiddleware.checkEmail(true),
  authController.signUp
);
router.post(
  "/sign-in",
  commonMiddleware.validateBody(UserValidator.signIn),
  authMiddleware.checkEmail(),
  authController.signIn
);

router.post(
  "/refresh",
  authMiddleware.checkRefreshToken,
  authController.refresh
);

router.post(
  "/verify-email",
  authMiddleware.checkActionToken(ActionTokenTypeEnum.VERIFY_EMAIL),
  authController.verify
);

router.post(
  "/resend-verification",
  authMiddleware.checkAccessToken,
  authController.resendVerifyEmail
);

// send email
router.post(
  "/password-forgot",
  commonMiddleware.validateBody(UserValidator.forgotPassword),
  authController.forgotPassword
);

router.post("/logout", authMiddleware.checkAccessToken, authController.logout);
router.post(
  "/logout-all",
  authMiddleware.checkAccessToken,
  authController.logoutAll
);

// ask to restore account
router.post(
  "/account-restore",
  commonMiddleware.validateBody(UserValidator.accountRestore),
  authController.accountRestore
);
// endregion POST

// region PUT
// email
router.put(
  "/account-restore",
  authMiddleware.checkActionToken(ActionTokenTypeEnum.ACCOUNT_RESTORE),
  // at this point user can set the old one password
  authController.accountRestoreSet
);

router.put(
  "/password-forgot",
  authMiddleware.checkActionToken(ActionTokenTypeEnum.FORGOT_PASSWORD),
  authController.forgotPasswordSet
);

router.put(
  "/password-change",
  commonMiddleware.validateBody(UserValidator.changePassword),
  authMiddleware.checkAccessToken,
  authController.changePassword
);
// endregion PUT

export const authRouter = router;
