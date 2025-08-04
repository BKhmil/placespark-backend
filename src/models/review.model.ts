import { model, Schema } from "mongoose";

import { IReview } from "../interfaces/review.interface";

const reviewSchema = new Schema(
  {
    placeId: { type: Schema.Types.ObjectId, required: true, ref: "places" },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "users" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: "" },
    check: { type: Number, default: 0 },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export const Review = model<IReview>("reviews", reviewSchema);
