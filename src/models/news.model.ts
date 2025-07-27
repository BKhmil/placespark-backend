import { model, Schema } from "mongoose";

import { NewsTypeEnum } from "../enums/news-type.enum";
import { INews } from "../interfaces/news.interface";

const newsSchema = new Schema(
  {
    placeId: { type: Schema.Types.ObjectId, required: true, ref: "Place" },
    type: { type: String, enum: Object.values(NewsTypeEnum), required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
    photo: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

export const News = model<INews>("news", newsSchema);
