import { Types } from "mongoose";

import { ActionTokenTypeEnum } from "../enums/action-token-type.enum";

export interface IActionToken {
  _id: Types.ObjectId | string;
  token: string;
  type: ActionTokenTypeEnum;
  _userId: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}
