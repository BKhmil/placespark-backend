import { Types } from "mongoose";

import { IOldPassword } from "../interfaces/old-password.interface";
import { OldPassword } from "../models/old-password.model";

class OldPasswordRepository {
  public async create(dto: IOldPassword) {
    return await OldPassword.create(dto);
  }

  public async getMany(userId: Types.ObjectId | string) {
    return await OldPassword.find({ _userId: userId });
  }

  public async delete(password: string) {
    return await OldPassword.deleteMany({ password });
  }

  public async deleteManyByUserId(userId: Types.ObjectId | string) {
    return await OldPassword.deleteMany({ _userId: userId });
  }

  public async deleteBeforeDate(date: Date): Promise<number> {
    const { deletedCount } = await OldPassword.deleteMany({
      createdAt: { $lt: date },
    });
    return deletedCount;
  }
}

export const oldPasswordRepository = new OldPasswordRepository();
