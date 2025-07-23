import { OrderEnum } from "../enums/order.enum";
import { RoleEnum } from "../enums/role.enum";
import { UserListOrderEnum } from "../enums/user-list-order.enum";
import { ITokenPair } from "./token.interface";

export interface IUser {
  _id: string;
  email: string;
  password: string;
  role: RoleEnum;
  name: string;
  favorites: string[];
  admin_establishments: string[];
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
  "_id" | "name" | "email" | "isVerified" | "createdAt" | "updatedAt" | "role"
>;

export interface IUserListResponseDto extends IUserListQuery {
  data: IUserResponseDto[];
  total: number;
}

// ------------- AUTH -------------
// region Request
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
// endregion Request

// region Response
export type ISignInResponseDto = {
  user: IUserResponseDto;
  tokens: ITokenPair;
};

export type ISignUpRestoreResponseDto = { canRestore: true };
// endregion Response
