import { model, Schema } from "mongoose";

import { PlaceFeatureEnum } from "../enums/place-feature.enum";
import { PlaceTypeEnum } from "../enums/place-type.enum";
import { PlaceWorkingDayEnum } from "../enums/place-working-day.enum";
import { IPlaceModel } from "../interfaces/place.interface";

const placeSchema = new Schema<IPlaceModel>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    photo: { type: String, default: "" },
    tags: { type: [String], default: [] },
    type: { type: String, enum: Object.values(PlaceTypeEnum), required: true },
    features: {
      type: [String],
      enum: Object.values(PlaceFeatureEnum),
      default: [],
    },
    averageCheck: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    isModerated: { type: Boolean, default: false },
    views: {
      type: [
        {
          userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
          date: { type: Date, required: true },
        },
      ],
      default: [],
    },
    contacts: {
      phone: { type: String, default: "" },
      tg: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    workingHours: {
      type: [
        {
          day: {
            type: String,
            enum: Object.values(PlaceWorkingDayEnum),
            required: true,
          },
          from: { type: String },
          to: { type: String },
          closed: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

placeSchema.index({ location: "2dsphere" });
placeSchema.index({ name: "text" });

export const Place = model<IPlaceModel>("places", placeSchema);
