import { Router } from "express";

import { userController } from "../controllers/user.controller";
import { RoleEnum } from "../enums/role.enum";
import { authMiddleware } from "../middlewares/auth.middleware";
import { commonMiddleware } from "../middlewares/common.middleware";
import { fileUploadMiddleware } from "../middlewares/file-upload.middleware";
import { PlaceValidator } from "../validators/place.validator";
import { UserValidator } from "../validators/user.validator";

const router = Router();

router.get("/me", authMiddleware.checkAccessToken, userController.getMe);

router.get(
  "/me/establishments",
  authMiddleware.checkAccessToken,
  authMiddleware.checkRole([RoleEnum.ESTABLISHMENT_ADMIN, RoleEnum.SUPERADMIN]),
  commonMiddleware.validateQuery(PlaceValidator.getListQuery),
  userController.getMyEstablishments
);

// router.get(
//   "/me/reviews",
//   authMiddleware.checkAccessToken,
//   authMiddleware.checkRole([RoleEnum.CRITIC, RoleEnum.USER]),
//   userController.getMyReviews
// );

// router.get(
//   "/me/ratings",
//   authMiddleware.checkAccessToken,
//   authMiddleware.checkRole([RoleEnum.CRITIC, RoleEnum.USER]),
//   userController.getMyRatings
// );

router.get(
  "/all",
  authMiddleware.checkAccessToken,
  authMiddleware.checkRole([RoleEnum.SUPERADMIN]),
  commonMiddleware.validateQuery(UserValidator.getListQuery),
  userController.getAll
);

router.get(
  "/:userId",
  authMiddleware.checkAccessToken,
  authMiddleware.checkRole([RoleEnum.SUPERADMIN]),
  commonMiddleware.isIdValid("userId"),
  userController.getUserById
);

router.patch(
  "/me",
  authMiddleware.checkAccessToken,
  authMiddleware.checkRole([
    RoleEnum.USER,
    RoleEnum.CRITIC,
    RoleEnum.ESTABLISHMENT_ADMIN,
    RoleEnum.SUPERADMIN,
  ]),
  commonMiddleware.validateBody(UserValidator.updateMe),
  userController.updateMe
);

router.patch(
  "/:userId/photo",
  authMiddleware.checkAccessToken,
  authMiddleware.checkRole([
    RoleEnum.USER,
    RoleEnum.CRITIC,
    RoleEnum.ESTABLISHMENT_ADMIN,
    RoleEnum.SUPERADMIN,
  ]),
  commonMiddleware.isIdValid("userId"),
  fileUploadMiddleware.uploadUsersPhoto().single("photo"),
  fileUploadMiddleware.checkFile,
  userController.updatePhoto
);

// I decided to separate PATCH me and PATCH by userid for superadmin
// router.patch(
//   "/:userId",
//   authMiddleware.checkAccessToken,
//   authMiddleware.checkRole([RoleEnum.SUPERADMIN]),
//   userController.updateUser
// );

router.delete("/me", authMiddleware.checkAccessToken, userController.deleteMe);

router.delete(
  "/:userId",
  authMiddleware.checkAccessToken,
  authMiddleware.checkRole([RoleEnum.SUPERADMIN]),
  commonMiddleware.isIdValid("userId"),
  userController.deleteUser
);

// router.patch(
//   "/:userId/role",
//   authMiddleware.checkAccessToken,
//   authMiddleware.checkRole([RoleEnum.SUPERADMIN]),
//   userController.changeRole
// );

// router.patch(
//   "/reassign-establishment",
//   authMiddleware.checkAccessToken,
//   authMiddleware.checkRole([RoleEnum.SUPERADMIN]),
//   userController.reassignEstablishment
// );

router.post(
  "/favorites",
  authMiddleware.checkAccessToken,
  authMiddleware.checkRole([
    RoleEnum.USER,
    RoleEnum.CRITIC,
    // In my opinion RoleEnum.SUPERADMIN and RoleEnum.ESTABLISHMENT_ADMIN don't need this option
  ]),
  userController.addFavorite
);

router.delete(
  "/favorites",
  authMiddleware.checkAccessToken,
  authMiddleware.checkRole([RoleEnum.USER, RoleEnum.CRITIC]),
  userController.removeFavorite
);

export const userRouter = router;
