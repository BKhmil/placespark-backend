import { model, Schema } from "mongoose";

import { RoleEnum } from "../enums/role.enum";
import { IUser } from "../interfaces/user.interface";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(RoleEnum), required: true },
    name: { type: String, required: true },
    photo: { type: String, default: "" },
    favorites: { type: [Schema.Types.ObjectId], default: [], ref: "Place" },
    admin_establishments: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "Place",
    },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

export const User = model<IUser>("users", userSchema);
