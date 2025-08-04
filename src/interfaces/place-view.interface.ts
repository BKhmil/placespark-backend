import { Types } from "mongoose";

export interface IPlaceView {
  _id: Types.ObjectId | string;
  placeId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  date: Date;
}
