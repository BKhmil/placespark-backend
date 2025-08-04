import joi from "joi";

export class ReviewValidator {
  private static rating = joi.number().min(1).max(5);
  private static text = joi.string().max(1000).trim();
  private static check = joi.number().min(0);

  public static create = joi.object({
    rating: this.rating.required(),
    text: this.text.optional(),
    check: this.check.optional(),
  });

  public static update = joi.object({
    rating: this.rating.optional(),
    text: this.text.optional(),
    check: this.check.optional(),
  });
}
