import { Types } from "mongoose";

import { NewsTypeEnum } from "../enums/news-type.enum";

export interface INews {
  _id: Types.ObjectId | string;
  placeId: Types.ObjectId | string;
  type: NewsTypeEnum;
  title: string;
  text: string;
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type INewsCreate = Pick<
  INews,
  "placeId" | "type" | "title" | "text" | "photo"
>;

export type INewsUpdate = Pick<INews, "title" | "text">;
