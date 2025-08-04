import { Router } from "express";

import { newsController } from "../controllers/news.controller";
import { placeController } from "../controllers/place.controller";
import { reviewController } from "../controllers/review.controller";
import { RoleEnum } from "../enums/role.enum";
import { authMiddleware } from "../middlewares/auth.middleware";
import { commonMiddleware } from "../middlewares/common.middleware";
import { fileUploadMiddleware } from "../middlewares/file-upload.middleware";
import { NewsValidator } from "../validators/news.validator";
import { PlaceValidator } from "../validators/place.validator";
import { ReviewValidator } from "../validators/review.validator";

const router = Router();

router.get(
  "/",
  commonMiddleware.validateQuery(PlaceValidator.getListQuery),
  placeController.getList
);
router.get("/tags", placeController.getAllTags);
router.get(
  "/:placeId/views-stats",
  authMiddleware.checkAccessToken,
  authMiddleware.checkVerifiedUser,
  authMiddleware.checkRole([RoleEnum.ESTABLISHMENT_ADMIN, RoleEnum.SUPERADMIN]),
  commonMiddleware.isIdValid("placeId"),
  placeController.getViewsStats
);

router.get(
  "/:placeId/news",
  commonMiddleware.isIdValid("placeId"),
  newsController.getByPlaceId
);

router.get(
  "/:placeId/news/:newsId",
  commonMiddleware.isIdValid("placeId"),
  commonMiddleware.isIdValid("newsId"),
  newsController.getById
);
// to prevent path collision
router.get(
  "/:placeId",
  commonMiddleware.isIdValid("placeId"),
  placeController.getById
);

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
  authMiddleware.checkRole([RoleEnum.ESTABLISHMENT_ADMIN, RoleEnum.SUPERADMIN]),
  commonMiddleware.validateBody(PlaceValidator.create),
  placeController.create
);

router.post(
  "/:placeId/view",
  authMiddleware.checkAccessToken,
  authMiddleware.checkRole([RoleEnum.USER, RoleEnum.CRITIC]),
  commonMiddleware.isIdValid("placeId"),
  placeController.addView
);

router.post(
  "/:placeId/news",
  authMiddleware.checkAccessToken,
  authMiddleware.checkVerifiedUser,
  authMiddleware.checkRole([RoleEnum.ESTABLISHMENT_ADMIN]),
  commonMiddleware.isIdValid("placeId"),
  commonMiddleware.validateBody(NewsValidator.create),
  newsController.create
);

router.post(
  "/:placeId/reviews",
  authMiddleware.checkAccessToken,
  authMiddleware.checkVerifiedUser,
  authMiddleware.checkRole([RoleEnum.USER, RoleEnum.CRITIC]),
  commonMiddleware.isIdValid("placeId"),
  commonMiddleware.validateBody(ReviewValidator.create),
  reviewController.create
);
//
// router.patch(
//   "/:placeId/moderate",
//   authMiddleware.checkAccessToken,
//   authMiddleware.checkRole([RoleEnum.SUPERADMIN]),
//   placeController.moderate
// );

router.patch(
  "/:placeId/photo",
  authMiddleware.checkAccessToken,
  authMiddleware.checkVerifiedUser,
  authMiddleware.checkRole([RoleEnum.ESTABLISHMENT_ADMIN, RoleEnum.SUPERADMIN]),
  commonMiddleware.isIdValid("placeId"),
  fileUploadMiddleware.uploadPlacesPhoto().single("photo"),
  fileUploadMiddleware.checkFile,
  placeController.updatePhoto
);

// Since news always belongs to a specific place, I chose this approach using a nested resource
// todo: somehow separate, means keep it as a part of the placesRouter, but router.use('/news', newsRouter)
router.patch(
  "/:placeId/news/:newsId/photo",
  authMiddleware.checkAccessToken,
  authMiddleware.checkVerifiedUser,
  commonMiddleware.isIdValid("placeId"),
  commonMiddleware.isIdValid("newsId"),
  authMiddleware.checkRole([RoleEnum.ESTABLISHMENT_ADMIN, RoleEnum.SUPERADMIN]),
  fileUploadMiddleware.uploadNewsPhoto().single("photo"),
  fileUploadMiddleware.checkFile,
  newsController.updatePhoto
);

router.patch(
  "/:placeId/reviews/:reviewId",
  authMiddleware.checkAccessToken,
  authMiddleware.checkVerifiedUser,
  authMiddleware.checkRole([
    RoleEnum.USER,
    RoleEnum.CRITIC,
    RoleEnum.SUPERADMIN,
  ]),
  commonMiddleware.isIdValid("placeId"),
  commonMiddleware.isIdValid("reviewId"),
  commonMiddleware.validateBody(ReviewValidator.update),
  reviewController.update
);

router.patch(
  "/:placeId/news/:newsId",
  authMiddleware.checkAccessToken,
  authMiddleware.checkVerifiedUser,
  authMiddleware.checkRole([RoleEnum.ESTABLISHMENT_ADMIN, RoleEnum.SUPERADMIN]),
  commonMiddleware.isIdValid("placeId"),
  commonMiddleware.isIdValid("newsId"),
  commonMiddleware.validateBody(NewsValidator.update),
  newsController.update
);

router.patch(
  "/:placeId",
  authMiddleware.checkAccessToken,
  authMiddleware.checkVerifiedUser,
  authMiddleware.checkRole([RoleEnum.ESTABLISHMENT_ADMIN, RoleEnum.SUPERADMIN]),
  commonMiddleware.isIdValid("placeId"),
  commonMiddleware.validateBody(PlaceValidator.update),
  placeController.update
);

router.delete(
  "/:placeId/news/:newsId",
  authMiddleware.checkAccessToken,
  authMiddleware.checkVerifiedUser,
  authMiddleware.checkRole([RoleEnum.ESTABLISHMENT_ADMIN, RoleEnum.SUPERADMIN]),
  commonMiddleware.isIdValid("placeId"),
  commonMiddleware.isIdValid("newsId"),
  newsController.delete
);

router.delete(
  "/:placeId/reviews/:reviewId",
  authMiddleware.checkAccessToken,
  authMiddleware.checkVerifiedUser,
  authMiddleware.checkRole([
    RoleEnum.USER,
    RoleEnum.CRITIC,
    RoleEnum.SUPERADMIN,
  ]),
  commonMiddleware.isIdValid("placeId"),
  commonMiddleware.isIdValid("reviewId"),
  reviewController.delete
);

router.delete(
  "/:placeId",
  authMiddleware.checkAccessToken,
  authMiddleware.checkVerifiedUser,
  authMiddleware.checkRole([RoleEnum.ESTABLISHMENT_ADMIN, RoleEnum.SUPERADMIN]),
  commonMiddleware.isIdValid("placeId"),
  placeController.delete
);

export default router;
