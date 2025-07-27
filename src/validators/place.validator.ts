import joi from "joi";

import { regexConstant } from "../constants/regex.constant";
import { OrderEnum } from "../enums/order.enum";
import { PlaceFeatureEnum } from "../enums/place-feature.enum";
import { PlaceListOrderEnum } from "../enums/place-list-order.enum";
import { PlaceTypeEnum } from "../enums/place-type.enum";
import { PlaceWorkingDayEnum } from "../enums/place-working-day.enum";

export class PlaceValidator {
  private static name = joi.string().min(1).max(100).trim();
  private static description = joi.string().allow("").max(1000).trim();
  private static address = joi.string().min(5).max(200).trim();
  private static location = joi.object({
    lat: joi.number(),
    lng: joi.number(),
  });
  private static tags = joi.array().items(joi.string());
  private static type = joi
    .string()
    .valid(...Object.values(PlaceTypeEnum))
    .trim();
  private static features = joi
    .array()
    .items(joi.string().valid(...Object.values(PlaceFeatureEnum)));
  private static averageCheck = joi.number().min(0);
  private static createdBy = joi.string();
  private static contacts = joi
    .object({
      phone: joi
        .string()
        .pattern(regexConstant.PHONE_UA_REGEX)
        .allow("")
        .optional(),
      tg: joi.string().pattern(regexConstant.TG_REGEX).allow("").optional(),
      email: joi.string().pattern(regexConstant.EMAIL).allow("").optional(),
    })
    .optional();
  private static workingHour = joi.object({
    day: joi
      .string()
      .valid(...Object.values(PlaceWorkingDayEnum))
      .required(),
    from: joi
      .string()
      .pattern(regexConstant.REGEX_TIME_HH_MM)
      .allow("")
      .optional(),
    to: joi
      .string()
      .pattern(regexConstant.REGEX_TIME_HH_MM)
      .allow("")
      .optional(),
    closed: joi.boolean().optional(),
  });
  private static workingHours = joi
    .array()
    .length(7)
    .items(PlaceValidator.workingHour);

  public static create = joi.object({
    name: this.name.required(),
    description: this.description.optional(),
    address: this.address.required(),
    location: this.location.required(),
    tags: this.tags.optional(),
    type: this.type.required(),
    features: this.features.optional(),
    averageCheck: this.averageCheck.optional(),
    createdBy: this.createdBy.required(),
    contacts: this.contacts.optional(),
    workingHours: this.workingHours.optional(),
  });

  public static update = joi.object({
    name: this.name.optional(),
    description: this.description.optional(),
    address: this.address.optional(),
    location: this.location.optional(),
    tags: this.tags.optional(),
    type: this.type.optional(),
    features: this.features.optional(),
    averageCheck: this.averageCheck.optional(),
    contacts: this.contacts.optional(),
    workingHours: this.workingHours.optional(),
  });

  public static getListQuery = joi.object({
    limit: joi.number().min(1).max(100).default(10),
    page: joi.number().min(1).default(1),
    name: this.name.optional(),
    type: this.type.optional(),
    rating: joi.number().min(0).optional(),
    averageCheckMin: joi.number().min(0).optional(),
    averageCheckMax: joi.number().min(0).optional(),
    tags: joi.alternatives().try(joi.array().items(joi.string()), joi.string()),
    features: joi
      .alternatives()
      .try(joi.array().items(joi.string()), joi.string()),
    isModerated: joi.boolean().optional(),
    isDeleted: joi.boolean().optional(),
    adminId: joi.string().optional(),
    order: joi
      .string()
      .valid(...Object.values(OrderEnum))
      .default(OrderEnum.DESC),
    latitude: joi.number().optional(),
    longitude: joi.number().optional(),
    orderBy: joi
      .string()
      .valid(...Object.values(PlaceListOrderEnum))
      .default(PlaceListOrderEnum.CREATED_AT),
  });
}
