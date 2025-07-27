import joi from "joi";

import { NewsTypeEnum } from "../enums/news-type.enum";

export class NewsValidator {
  private static title = joi.string().min(1).max(100).trim();
  private static text = joi.string().max(1000).trim();
  private static type = joi.string().valid(...Object.values(NewsTypeEnum));

  public static create = joi.object({
    title: this.title.required(),
    text: this.text.required(),
    type: this.type.required(),
  });

  public static update = joi.object({
    title: this.title.optional(),
    text: this.text.optional(),
  });
}
