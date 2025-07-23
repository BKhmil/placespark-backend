import { model, Schema } from "mongoose";

import { PlaceFeatureEnum } from "../enums/place-feature.enum";
import { PlaceTypeEnum } from "../enums/place-type.enum";
import { IPlace } from "../interfaces/place.interface";

const placeSchema = new Schema<IPlace>(
  {
    name: { type: String, required: true },
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
    createdBy: { type: String, required: true },
    isModerated: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    views: {
      type: [
        {
          userId: { type: String, required: true },
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
  },
  { timestamps: true, versionKey: false }
);

placeSchema.index({ location: "2dsphere" });
placeSchema.index({ name: "text" });

export const Place = model<IPlace>("places", placeSchema);
