import { model, Schema } from "mongoose";

import { RoleEnum } from "../enums/role.enum";
import { IUser } from "../interfaces/user.interface";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(RoleEnum), required: true },
    name: { type: String, required: true },
    favorites: { type: [String], default: [] },
    admin_establishments: { type: [String], default: [] },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

export const User = model<IUser>("users", userSchema);
