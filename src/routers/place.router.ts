import { Router } from "express";

import { placeController } from "../controllers/place.controller";
import { RoleEnum } from "../enums/role.enum";
import { authMiddleware } from "../middlewares/auth.middleware";
import { commonMiddleware } from "../middlewares/common.middleware";
import { PlaceValidator } from "../validators/place.validator";

const router = Router();

router.get(
  "/",
  commonMiddleware.validateQuery(PlaceValidator.getListQuery),
  placeController.getList
);
router.get("/tags", placeController.getAllTags);
router.get(
  "/:placeId",
  commonMiddleware.isIdValid("placeId"),
  placeController.getById
);

// router.get(
//   "/:placeId/views-stats",
//   authMiddleware.checkAccessToken,
//   authMiddleware.checkRole([RoleEnum.USER, RoleEnum.SUPERADMIN]),
//   placeController.getViewsStats
// );
//
// router.get(
//   "/analytics",
//   authMiddleware.checkAccessToken,
//   authMiddleware.checkRole([RoleEnum.SUPERADMIN]),
//   placeController.getAnalytics
// );
//
// router.get(
//   "/unmoderated",
//   authMiddleware.checkAccessToken,
//   authMiddleware.checkRole([RoleEnum.SUPERADMIN]),
//   placeController.getUnmoderated
// );
//
router.post(
  "/",
  authMiddleware.checkAccessToken,
  authMiddleware.checkVerifiedUser,
  authMiddleware.checkRole([RoleEnum.USER, RoleEnum.SUPERADMIN]),
  commonMiddleware.validateBody(PlaceValidator.create),
  placeController.create
);

// router.post(
//   "/:placeId/view",
//   authMiddleware.checkAccessToken,
//   placeController.addView
// );
//
// router.patch(
//   "/:placeId/moderate",
//   authMiddleware.checkAccessToken,
//   authMiddleware.checkRole([RoleEnum.SUPERADMIN]),
//   placeController.moderate
// );

router.put(
  "/:placeId",
  authMiddleware.checkAccessToken,
  authMiddleware.checkVerifiedUser,
  commonMiddleware.isIdValid("placeId"),
  authMiddleware.checkRole([RoleEnum.USER, RoleEnum.SUPERADMIN]),
  commonMiddleware.validateBody(PlaceValidator.update),
  placeController.update
);

router.delete(
  "/:placeId",
  authMiddleware.checkAccessToken,
  authMiddleware.checkVerifiedUser,
  commonMiddleware.isIdValid("placeId"),
  authMiddleware.checkRole([RoleEnum.USER, RoleEnum.SUPERADMIN]),
  placeController.delete
);

export default router;
