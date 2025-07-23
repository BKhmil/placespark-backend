import { FilterQuery } from "mongoose";

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

  public async create(dto: ISignUpRequestDto): Promise<IUser> {
    return await User.create(dto);
  }

  public async getById(userId: string): Promise<IUser> {
    return await User.findById(userId);
  }

  public async getByEmail(email: string): Promise<IUser> {
    return await User.findOne({ email });
  }

  public async updateById(userId: string, dto: Partial<IUser>): Promise<IUser> {
    return await User.findByIdAndUpdate(userId, dto, { new: true });
  }

  public async softDeleteById(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  }

  public async addFavorite(
    userId: string,
    placeId: string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: placeId } },
      { new: true }
    );
  }

  public async removeFavorite(
    userId: string,
    placeId: string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: placeId } },
      { new: true }
    );
  }

  public async isFavorite(userId: string, placeId: string): Promise<boolean> {
    const user = await User.findOne({ _id: userId, favorites: placeId });
    return !!user;
  }
}

export const userRepository = new UserRepository();
