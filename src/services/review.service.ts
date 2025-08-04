import { Types } from "mongoose";

import { ERRORS } from "../constants/errors.constant";
import { RoleEnum } from "../enums/role.enum";
import { ApiError } from "../errors/api.error";
import { idsEqual } from "../helpers/equals.helper";
import { IReview } from "../interfaces/review.interface";
import { ITokenPayload } from "../interfaces/token.interface";
import { placeRepository } from "../repositories/place.repository";
import { reviewRepository } from "../repositories/review.repository";

class ReviewService {
  public create = async (
    placeId: Types.ObjectId | string,
    dto: Partial<IReview>,
    tokenPayload: ITokenPayload
  ): Promise<IReview> => {
    await this.isPlaceModerated(placeId);
    // Only USER/CRITIC can create, checked in router
    // Check if user already wrote review for this place
    const existing = await this.findUserReviewForPlace(
      placeId,
      tokenPayload.userId
    );
    if (existing) {
      throw new ApiError(
        "You have already written a review for this place",
        409
      );
    }
    const review = await reviewRepository.create({
      ...dto,
      placeId,
      userId: tokenPayload.userId,
      isEdited: false,
    });

    // Оновити рейтинг закладу
    await this.updatePlaceRating(placeId);

    return review;
  };

  public getByPlace = async (placeId: string): Promise<IReview[]> => {
    return await reviewRepository.getByPlace(placeId);
  };

  public getByUser = async (userId: string): Promise<IReview[]> => {
    return await reviewRepository.getByUser(userId);
  };

  public getById = async (reviewId: string): Promise<IReview | null> => {
    return await reviewRepository.getById(reviewId);
  };

  public update = async (
    placeId: Types.ObjectId | string,
    reviewId: Types.ObjectId | string,
    dto: Partial<IReview>,
    tokenPayload: ITokenPayload
  ): Promise<IReview> => {
    await this.isPlaceModerated(placeId);
    const review = await this.reviewExistsOrThrow(reviewId);
    this.checkReviewBelongsToPlaceOrThrow(placeId, review.placeId);

    this.checkHasAccessOrThrow(
      tokenPayload.role,
      tokenPayload.userId,
      review.userId
    );

    if (!review.isEdited) {
      dto.isEdited = true;
    }
    const updated = await reviewRepository.updateById(reviewId, dto);

    await this.updatePlaceRating(placeId);

    return updated;
  };

  public delete = async (
    placeId: Types.ObjectId | string,
    reviewId: Types.ObjectId | string,
    tokenPayload: ITokenPayload
  ): Promise<void> => {
    await this.isPlaceModerated(placeId);
    const review = await this.reviewExistsOrThrow(reviewId);
    this.checkReviewBelongsToPlaceOrThrow(placeId, review.placeId);

    this.checkHasAccessOrThrow(
      tokenPayload.role,
      tokenPayload.userId,
      review.userId
    );

    await reviewRepository.deleteById(reviewId);

    // Оновити рейтинг закладу
    await this.updatePlaceRating(placeId);
  };

  private updatePlaceRating = async (
    placeId: Types.ObjectId | string
  ): Promise<void> => {
    const reviews = await reviewRepository.getByPlace(placeId.toString());

    if (reviews.length === 0) {
      await placeRepository.updateById(placeId.toString(), { rating: 0 });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

    await placeRepository.updateById(placeId.toString(), {
      rating: averageRating,
    });
  };

  private findUserReviewForPlace = async (
    placeId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<IReview | null> => {
    const reviews = await reviewRepository.getByPlace(placeId);
    return reviews.find((r) => r.userId.toString() === userId.toString());
  };

  // I have this method in some other services too,
  // so it feels like I should move it to a separate file(?)
  // however,in general, functionality is the same, but the implementation is different
  private checkHasAccessOrThrow = (
    role: string,
    userId: Types.ObjectId | string,
    reviewUserId: Types.ObjectId | string //review.userId
  ): void => {
    if (role === RoleEnum.SUPERADMIN) {
      return;
    }
    if (!idsEqual(userId, reviewUserId)) {
      throw new ApiError("You are not allowed to access this place", 403);
    }
  };

  private isPlaceModerated = async (placeId: Types.ObjectId | string) => {
    const place = await placeRepository.getById(placeId);
    if (!place)
      throw new ApiError(ERRORS.NOT_FOUND.message, ERRORS.NOT_FOUND.statusCode);
    if (!place.isModerated) throw new ApiError("Place is not moderated", 403);
    return place;
  };

  private reviewExistsOrThrow = async (reviewId: Types.ObjectId | string) => {
    const review = await reviewRepository.getById(reviewId);
    if (!review)
      throw new ApiError(ERRORS.NOT_FOUND.message, ERRORS.NOT_FOUND.statusCode);
    return review;
  };

  private checkReviewBelongsToPlaceOrThrow = (
    placeId: Types.ObjectId | string,
    reviewPlaceId: Types.ObjectId | string
  ): void => {
    if (!idsEqual(placeId, reviewPlaceId)) {
      throw new ApiError("You are not allowed to access this review", 403);
    }
  };
}

export const reviewService = new ReviewService();
