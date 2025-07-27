import { Types } from "mongoose";

import { ERRORS } from "../constants/errors.constant";
import { ModerateOptionsEnum } from "../enums/moderate-options.enum";
import { RoleEnum } from "../enums/role.enum";
import { ApiError } from "../errors/api.error";
import {
  deleteFile,
  deleteFolder,
  getCloudinaryPublicId,
} from "../helpers/cloudinary.helper";
import {
  IPlaceListQuery,
  IPlaceListResponseDto,
} from "../interfaces/place.interface";
import { ITokenPayload } from "../interfaces/token.interface";
import {
  IUser,
  IUserListQuery,
  IUserListResponseDto,
  IUserResponseDto,
  IUserUpdateRequestDto,
} from "../interfaces/user.interface";
import { placePresenter } from "../presenters/place.presenter";
import { userPresenter } from "../presenters/user.presenter";
import { actionTokenRepository } from "../repositories/action-token.repository";
import { placeRepository } from "../repositories/place.repository";
import { tokenRepository } from "../repositories/token.repository";
import { userRepository } from "../repositories/user.repository";

class UserService {
  public async getList(query: IUserListQuery): Promise<IUserListResponseDto> {
    const { entities, total } = await userRepository.getList(query);
    return userPresenter.toResponseList(entities, total, query);
  }

  public async getMe(tokenPayload: ITokenPayload): Promise<IUserResponseDto> {
    const user = await this.findUserOrThrow(
      tokenPayload.userId,
      ERRORS.USER_NOT_FOUND_AFTER_AUTH.message,
      ERRORS.USER_NOT_FOUND_AFTER_AUTH.statusCode
    );
    return userPresenter.toResponse(user);
  }

  public async updateMe(
    tokenPayload: ITokenPayload,
    dto: IUserUpdateRequestDto
  ): Promise<IUserResponseDto> {
    // I have findUserOrThrow method, but I don't want to use it in <update...> methods
    // because I don't want to make additional request to the database
    const user = await userRepository.updateById(tokenPayload.userId, dto);
    if (!user)
      throw new ApiError(ERRORS.NOT_FOUND.message, ERRORS.NOT_FOUND.statusCode);

    return userPresenter.toResponse(user);
  }

  public async getUserById(
    userId: Types.ObjectId | string
  ): Promise<IUserResponseDto> {
    const user = await this.findUserOrThrow(
      userId,
      ERRORS.NOT_FOUND.message,
      ERRORS.NOT_FOUND.statusCode
    );
    return userPresenter.toResponse(user);
  }

  public async addFavorite(
    userId: Types.ObjectId | string,
    placeId: Types.ObjectId | string
  ): Promise<IUser> {
    const user = await userRepository.addFavorite(userId, placeId);
    if (!user)
      throw new ApiError(ERRORS.NOT_FOUND.message, ERRORS.NOT_FOUND.statusCode);
    return user;
  }

  public async removeFavorite(
    userId: Types.ObjectId | string,
    placeId: Types.ObjectId | string
  ): Promise<IUser> {
    const user = await userRepository.removeFavorite(userId, placeId);
    if (!user)
      throw new ApiError(ERRORS.NOT_FOUND.message, ERRORS.NOT_FOUND.statusCode);
    return user;
  }

  public async getMyEstablishments(
    tokenPayload: ITokenPayload,
    query: IPlaceListQuery
  ): Promise<IPlaceListResponseDto> {
    await this.findUserOrThrow(
      tokenPayload.userId,
      ERRORS.NOT_FOUND.message,
      ERRORS.NOT_FOUND.statusCode
    );

    const { entities, total } = await placeRepository.getList(
      {
        adminId: tokenPayload.userId as Types.ObjectId,
        ...query,
      },
      ModerateOptionsEnum.DEFAULT
    );

    return placePresenter.toResponseList(entities, total, query);
  }

  // public async getMyReviews(userId: Types.ObjectId | string) {
  //   return await reviewService.getByUser(userId);
  // }

  // public async getMyRatings(userId: Types.ObjectId | string) {
  //   const reviews = await reviewService.getByUser(userId);
  //   return reviews.filter((r) => r.rating > 0);
  // }

  public async updateUser(
    userId: Types.ObjectId | string,
    dto: Partial<IUser>
  ): Promise<IUser> {
    const user = await userRepository.updateById(userId, dto);
    if (!user)
      throw new ApiError(ERRORS.NOT_FOUND.message, ERRORS.NOT_FOUND.statusCode);
    return user;
  }

  public async deleteMe(tokenPayload: ITokenPayload): Promise<void> {
    await this.findUserOrThrow(
      tokenPayload.userId,
      ERRORS.USER_NOT_FOUND_AFTER_AUTH.message,
      ERRORS.USER_NOT_FOUND_AFTER_AUTH.statusCode
    );

    try {
      await deleteFolder(`placespark/users/${tokenPayload.userId}`);
    } catch (deleteError) {
      console.warn(
        "Failed to delete user folder from Cloudinary:",
        deleteError
      );
    }

    // Змінюємо роль на USER, очищаємо фото, робимо неверифікованим, очищаємо заклади та позначаємо як видаленого
    await userRepository.updateById(tokenPayload.userId, {
      role: RoleEnum.USER,
      photo: "",
      isVerified: false,
      admin_establishments: [],
      isDeleted: true,
    });
    await tokenRepository.deleteAllSignsByUserId(tokenPayload.userId);
    await actionTokenRepository.deleteManyByParams({
      _userId: tokenPayload.userId,
    });
  }

  public async deleteUser(userId: Types.ObjectId | string): Promise<void> {
    await this.findUserOrThrow(
      userId,
      ERRORS.NOT_FOUND.message,
      ERRORS.NOT_FOUND.statusCode
    );

    try {
      await deleteFolder(`placespark/users/${userId}`);
    } catch (deleteError) {
      console.warn(
        "Failed to delete user folder from Cloudinary:",
        deleteError
      );
    }

    await userRepository.updateById(userId, {
      role: RoleEnum.USER,
      photo: "",
      isVerified: false,
      admin_establishments: [],
      isDeleted: true,
    });
  }

  // public async changeRole(
  //   userId: Types.ObjectId | string,
  //   role: RoleEnum
  // ): Promise<IUser> {
  //   const user = await userRepository.updateById(userId, { role });
  //   if (!user)
  //     throw new ApiError(ERRORS.NOT_FOUND.message, ERRORS.NOT_FOUND.statusCode);
  //   return user;
  // }

  public async updatePhoto(
    userId: Types.ObjectId | string,
    file: Express.Multer.File
  ) {
    try {
      const user = await this.findUserOrThrow(
        userId,
        ERRORS.NOT_FOUND.message,
        ERRORS.NOT_FOUND.statusCode
      );

      const oldPhotoUrl = user?.photo;

      const updatedUser = await userRepository.updatePhoto(userId, file.path);

      if (oldPhotoUrl) {
        const oldPublicId = getCloudinaryPublicId(oldPhotoUrl);
        if (oldPublicId) {
          try {
            await deleteFile(oldPublicId);
            // In case of an error while deleting file I should somehow handle this error,
            // becuase the old one photo can still exists in the cloudinary,
            // but honestly idk how to do it
          } catch (deleteError) {
            console.warn("Failed to delete old photo:", deleteError);
          }
        }
      }

      return userPresenter.toResponse(updatedUser);
    } catch (err) {
      const newPublicId = getCloudinaryPublicId(file.path);
      if (newPublicId) {
        try {
          await deleteFile(newPublicId);
        } catch (deleteError) {
          // same as above
          console.warn("Failed to delete new photo after error:", deleteError);
        }
      }

      throw new ApiError(
        err.message ? err.message : "Server error",
        (err as ApiError).statusCode ? (err as ApiError).statusCode : 500
      );
    }
  }

  // public async reassignEstablishment(
  //   placeId: string,
  //   newUserId: string
  // ): Promise<IPlace | null> {
  //   // update createdBy for Place
  //   return await placeRepository.updateById(placeId, { createdBy: newUserId });
  // }

  private async findUserOrThrow(
    userId: Types.ObjectId | string,
    errMessage: string,
    errCode: number
  ) {
    const user = await userRepository.getById(userId);
    if (!user) throw new ApiError(errMessage, errCode);
    return user;
  }
}

export const userService = new UserService();
