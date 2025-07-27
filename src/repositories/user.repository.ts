import { FilterQuery, Types } from "mongoose";

import { RoleEnum } from "../enums/role.enum";
import {
  ISignUpRequestDto,
  IUser,
  IUserListQuery,
} from "../interfaces/user.interface";
import { User } from "../models/user.model";

class UserRepository {
  public async getList(
    query: IUserListQuery
  ): Promise<{ entities: IUser[]; total: number }> {
    const filterObj: FilterQuery<IUser> = { isDeleted: false };

    if (query.name) {
      filterObj.name = { $regex: query.name, $options: "i" };
    }

    const skip = query.limit * (query.page - 1);

    const sortObj = { [query.orderBy]: query.order };

    const [entities, total] = await Promise.all([
      User.find(filterObj).sort(sortObj).limit(query.limit).skip(skip),
      User.countDocuments(filterObj),
    ]);
    return { entities, total };
  }

  public async create(
    dto: ISignUpRequestDto & { role: RoleEnum }
  ): Promise<IUser> {
    return await User.create(dto);
  }

  public async getById(userId: Types.ObjectId | string): Promise<IUser> {
    return await User.findById(userId);
  }

  public async getByEmail(email: string): Promise<IUser> {
    return await User.findOne({ email });
  }

  public async updateById(
    userId: Types.ObjectId | string,
    dto: Partial<IUser>
  ): Promise<IUser> {
    return await User.findByIdAndUpdate(userId, dto, { new: true });
  }

  public async softDeleteById(userId: Types.ObjectId | string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      isDeleted: true,
      deletedAt: new Date(),
      isVerified: false,
    });
  }

  public async addFavorite(
    userId: Types.ObjectId | string,
    placeId: Types.ObjectId | string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      { _id: userId },
      // since I have $addToSet, it will not add the placeId if it already exists
      // so I don't need to check if the placeId already exists
      { $addToSet: { favorites: placeId } },
      { new: true }
    );
  }

  public async removeFavorite(
    userId: Types.ObjectId | string,
    placeId: Types.ObjectId | string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      { _id: userId },
      { $pull: { favorites: placeId } },
      { new: true }
    );
  }

  public async addAdminEstablishment(
    userId: Types.ObjectId | string,
    placeId: Types.ObjectId | string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { admin_establishments: placeId } },
      { new: true }
    );
  }

  public async removeAdminEstablishment(
    userId: Types.ObjectId | string,
    placeId: Types.ObjectId | string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { admin_establishments: placeId } },
      { new: true }
    );
  }

  public async updatePhoto(
    userId: Types.ObjectId | string,
    photoUrl: string
  ): Promise<IUser> {
    return await User.findByIdAndUpdate(
      userId,
      { photo: photoUrl },
      { new: true }
    );
  }
}

export const userRepository = new UserRepository();
