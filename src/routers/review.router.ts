// import { Router } from "express";
// import { reviewController } from "../controllers/review.controller";
// import { RoleEnum } from "../enums/role.enum";
// import { authMiddleware, checkRole } from "../middlewares/auth.middleware";

// const router = Router();

// router.post("/", authMiddleware.checkAccessToken, reviewController.create);
// router.get("/place/:placeId", reviewController.getByPlace);
// router.put(
//   "/:reviewId",
//   authMiddleware.checkAccessToken,
//   reviewController.update
// );
// router.delete(
//   "/:reviewId",
//   authMiddleware.checkAccessToken,
//   reviewController.delete
// );

// router.patch(
//   "/:reviewId/admin",
//   authMiddleware.checkAccessToken,
//   checkRole([RoleEnum.SUPERADMIN]),
//   reviewController.updateByAdmin
// );

// router.delete(
//   "/:reviewId/admin",
//   authMiddleware.checkAccessToken,
//   checkRole([RoleEnum.SUPERADMIN]),
//   reviewController.deleteByAdmin
// );

// export default router;
