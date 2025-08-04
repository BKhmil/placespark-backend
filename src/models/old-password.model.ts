import { model, Schema } from "mongoose";

import { IOldPassword } from "../interfaces/old-password.interface";

const oldPasswordSchema = new Schema(
  {
    password: { type: String, required: true, unique: true },
    _userId: { type: Schema.Types.ObjectId, required: true, ref: "users" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const OldPassword = model<IOldPassword>(
  "old-password",
  oldPasswordSchema
);
