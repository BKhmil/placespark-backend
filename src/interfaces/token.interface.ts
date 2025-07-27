import { Types } from "mongoose";

export interface IToken {
  _id: Types.ObjectId | string;
  accessToken: string;
  refreshToken: string;
  _userId: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITokenPayload {
  userId: Types.ObjectId | string;
  role: string;
  name: string;
}

export type ITokenPair = Pick<IToken, "accessToken" | "refreshToken">;
