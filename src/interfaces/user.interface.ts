import { Types } from "mongoose";

import { OrderEnum } from "../enums/order.enum";
import { RoleEnum } from "../enums/role.enum";
import { UserListOrderEnum } from "../enums/user-list-order.enum";
import { ITokenPair } from "./token.interface";

export interface IUser {
  _id: Types.ObjectId | string;
  email: string; // update on future endpoint PUT(?) /api/auth/email-change
  password: string; // update on PUT /api/auth/password-change
  role: RoleEnum; // update on future endpoint with superadmin approval
  name: string; // update on PATCH/api/users/me
  favorites: string[]; // update on PATCH/api/users/me
  admin_establishments: string[]; // update automatically on create place
  photo: string;
  isDeleted: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type IUserListQuery = {
  page: number;
  limit: number;
  name?: string;
  order: OrderEnum;
  orderBy: UserListOrderEnum;
};

export type IUserResponseDto = Pick<
  IUser,
  | "_id"
  | "name"
  | "email"
  | "isVerified"
  | "createdAt"
  | "updatedAt"
  | "role"
  | "admin_establishments"
  | "favorites"
  | "photo"
>;

export interface IUserListResponseDto extends IUserListQuery {
  data: IUserResponseDto[];
  total: number;
}

export type ISignUpRequestDto = Pick<IUser, "email" | "password">;

export type IUserUpdateRequestDto = Pick<IUser, "email">;

export type ISignInRequestDto = Pick<IUser, "email" | "password">;

export type IForgotPasswordRequestDto = Pick<IUser, "name" | "email">;
export type IForgotPasswordSetRequestDto = Pick<IUser, "password"> & {
  token: string;
};

export type IAccountRestoreRequestDto = Pick<IUser, "email">;
export type IAccountRestoreSetRequestDto = Pick<IUser, "password"> & {
  token: string;
};

export type IChangePasswordRequestDto = {
  oldPassword: string;
  newPassword: string;
};

export type ISignInResponseDto = {
  user: IUserResponseDto;
  tokens: ITokenPair;
};

export type ISignUpRestoreResponseDto = { canRestore: true };
