import { Types } from "mongoose";

import { IReview } from "../interfaces/review.interface";
import { Review } from "../models/review.model";

class ReviewRepository {
  public async create(dto: Partial<IReview>): Promise<IReview> {
    return await Review.create(dto);
  }

  public async getByPlace(
    placeId: Types.ObjectId | string
  ): Promise<IReview[]> {
    return await Review.find({ placeId });
  }

  public async getByUser(userId: Types.ObjectId | string): Promise<IReview[]> {
    return await Review.find({ userId });
  }

  public async getByUserWithPlace(
    userId: Types.ObjectId | string
  ): Promise<IReview[]> {
    return await Review.find({ userId }).populate("placeId", "_id name photo");
  }

  public async getById(
    reviewId: Types.ObjectId | string
  ): Promise<IReview | null> {
    return await Review.findById(reviewId);
  }

  public async updateById(
    reviewId: Types.ObjectId | string,
    dto: Partial<IReview>
  ): Promise<IReview | null> {
    return await Review.findByIdAndUpdate(reviewId, dto, { new: true });
  }

  public async deleteById(reviewId: Types.ObjectId | string): Promise<void> {
    await Review.findByIdAndDelete(reviewId);
  }
}

export const reviewRepository = new ReviewRepository();
