import { Types } from "mongoose";

export interface IOldPassword {
  _id?: Types.ObjectId | string;
  _userId: Types.ObjectId | string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}
