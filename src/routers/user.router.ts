import { Router } from "express";

import { userController } from "../controllers/user.controller";
import { RoleEnum } from "../enums/role.enum";
import { authMiddleware, checkRole } from "../middlewares/auth.middleware";
import { commonMiddleware } from "../middlewares/common.middleware";
import { UserValidator } from "../validators/user.validator";

const router = Router();

router.get("/me", authMiddleware.checkAccessToken, userController.getMe);

router.get(
  "/me/establishments",
  authMiddleware.checkAccessToken,
  userController.getMyEstablishments
);

router.get(
  "/me/reviews",
  authMiddleware.checkAccessToken,
  userController.getMyReviews
);

router.get(
  "/me/ratings",
  authMiddleware.checkAccessToken,
  userController.getMyRatings
);

router.get(
  "/all",
  authMiddleware.checkAccessToken,
  checkRole([RoleEnum.SUPERADMIN]),
  commonMiddleware.validateQuery(UserValidator.getListQuery),
  userController.getAll
);

router.get(
  "/:userId",
  authMiddleware.checkAccessToken,
  commonMiddleware.isIdValid("userId"),
  userController.getUserById
);

router.patch(
  "/me",
  authMiddleware.checkAccessToken,
  commonMiddleware.validateBody(UserValidator.updateMe),
  userController.updateMe
);

router.patch(
  "/:userId",
  authMiddleware.checkAccessToken,
  checkRole([RoleEnum.SUPERADMIN]),
  userController.updateUser
);

router.delete("/me", authMiddleware.checkAccessToken, userController.deleteMe);

router.delete(
  "/:userId",
  authMiddleware.checkAccessToken,
  checkRole([RoleEnum.SUPERADMIN]),
  userController.deleteUser
);

router.patch(
  "/:userId/role",
  authMiddleware.checkAccessToken,
  checkRole([RoleEnum.SUPERADMIN]),
  userController.changeRole
);

router.patch(
  "/reassign-establishment",
  authMiddleware.checkAccessToken,
  checkRole([RoleEnum.SUPERADMIN]),
  userController.reassignEstablishment
);

router.post(
  "/favorites",
  authMiddleware.checkAccessToken,
  userController.addFavorite
);

router.delete(
  "/favorites",
  authMiddleware.checkAccessToken,
  userController.removeFavorite
);

router.get(
  "/favorites/check",
  authMiddleware.checkAccessToken,
  userController.isFavorite
);

export const userRouter = router;
