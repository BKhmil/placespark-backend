export interface IToken {
  _id: string;
  accessToken: string;
  refreshToken: string;
  _userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITokenPayload {
  userId: string;
  role: string;
  name: string;
}

export type ITokenPair = Pick<IToken, "accessToken" | "refreshToken">;
