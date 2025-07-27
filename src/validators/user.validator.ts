import joi from "joi";

import { regexConstant } from "../constants/regex.constant";
import { OrderEnum } from "../enums/order.enum";
import { UserListOrderEnum } from "../enums/user-list-order.enum";

export class UserValidator {
  private static name = joi.string().min(3).max(50).trim();
  private static email = joi.string().pattern(regexConstant.EMAIL).trim();
  private static password = joi.string().pattern(regexConstant.PASSWORD).trim();
  // private static role = joi.string().valid(...Object.values(RoleEnum));
  private static favorites = joi.array().items(joi.string());

  public static signUp = joi.object({
    email: this.email.required(),
    password: this.password.required(),
    name: this.name.required(),
  });

  public static updateMe = joi.object({
    name: this.name.optional(),
    favorites: this.favorites.optional(),
  });

  public static signIn = joi.object({
    email: this.email.required(),
    password: this.password.required(),
  });

  public static forgotPassword = joi.object({
    email: this.email.required(),
  });

  public static accountRestore = joi.object({
    email: this.email.required(),
  });

  public static changePassword = joi.object({
    newPassword: this.password.required(),
    oldPassword: this.password.required(),
  });

  public static getListQuery = joi.object({
    limit: joi.number().min(1).max(100).default(10),
    page: joi.number().min(1).default(1),
    name: joi.string().min(1).max(50).trim().optional(),
    order: joi
      .string()
      .valid(...Object.values(OrderEnum))
      .default(OrderEnum.ASC),
    orderBy: joi
      .string()
      .valid(...Object.values(UserListOrderEnum))
      .default(UserListOrderEnum.CREATED_AT),
  });
}
