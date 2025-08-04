import { Types } from "mongoose";

export interface IReview {
  _id: Types.ObjectId | string;
  placeId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  rating: number;
  text: string;
  check: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}
