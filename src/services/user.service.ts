import { ERRORS } from "../constants/errors.constant";
import { OrderEnum } from "../enums/order.enum";
import { RoleEnum } from "../enums/role.enum";
import { ApiError } from "../errors/api.error";
import { IPlace } from "../interfaces/place.interface";
import { ITokenPayload } from "../interfaces/token.interface";
import {
  IUser,
  IUserListQuery,
  IUserListResponseDto,
  IUserResponseDto,
  IUserUpdateRequestDto,
} from "../interfaces/user.interface";
import { userPresenter } from "../presenters/user.presenter";
import { actionTokenRepository } from "../repositories/action-token.repository";
import { placeRepository } from "../repositories/place.repository";
import { tokenRepository } from "../repositories/token.repository";
import { userRepository } from "../repositories/user.repository";
import { reviewService } from "./review.service";

class UserService {
  public async getList(query: IUserListQuery): Promise<IUserListResponseDto> {
    const { entities, total } = await userRepository.getList(query);
    return userPresenter.toResponseList(entities, total, query);
  }

  public async getMe(tokenPayload: ITokenPayload): Promise<IUserResponseDto> {
    return userPresenter.toResponse(
      await this.findUserOrThrow(
        tokenPayload.userId,
        ERRORS.USER_NOT_FOUND_AFTER_AUTH.message,
        ERRORS.USER_NOT_FOUND_AFTER_AUTH.statusCode
      )
    );
  }

  public async updateMe(
    tokenPayload: ITokenPayload,
    dto: IUserUpdateRequestDto
  ): Promise<IUserResponseDto> {
    const user = await this.findUserOrThrow(
      tokenPayload.userId,
      ERRORS.USER_NOT_FOUND_AFTER_AUTH.message,
      ERRORS.USER_NOT_FOUND_AFTER_AUTH.statusCode
    );
    return userPresenter.toResponse(
      await userRepository.updateById(user._id, dto)
    );
  }

  public async deleteMe(tokenPayload: ITokenPayload): Promise<void> {
    await this.findUserOrThrow(
      tokenPayload.userId,
      ERRORS.USER_NOT_FOUND_AFTER_AUTH.message,
      ERRORS.USER_NOT_FOUND_AFTER_AUTH.statusCode
    );

    await userRepository.softDeleteById(tokenPayload.userId);
    await tokenRepository.deleteAllSignsByUserId(tokenPayload.userId);
    await actionTokenRepository.deleteManyByParams({
      _userId: tokenPayload.userId,
    });
  }

  public async getUserById(userId: string): Promise<IUserResponseDto> {
    return userPresenter.toResponse(
      await this.findUserOrThrow(
        userId,
        ERRORS.USER_NOT_FOUND.message,
        ERRORS.USER_NOT_FOUND.statusCode
      )
    );
  }

  public async addFavorite(userId: string, placeId: string): Promise<IUser> {
    const user = await userRepository.addFavorite(userId, placeId);
    if (!user)
      throw new ApiError(
        ERRORS.USER_NOT_FOUND.message,
        ERRORS.USER_NOT_FOUND.statusCode
      );
    return user;
  }

  public async removeFavorite(userId: string, placeId: string): Promise<IUser> {
    const user = await userRepository.removeFavorite(userId, placeId);
    if (!user)
      throw new ApiError(
        ERRORS.USER_NOT_FOUND.message,
        ERRORS.USER_NOT_FOUND.statusCode
      );
    return user;
  }

  public async isFavorite(userId: string, placeId: string): Promise<boolean> {
    return await userRepository.isFavorite(userId, placeId);
  }

  public async getMyEstablishments(userId: string) {
    const user = await userRepository.getById(userId);
    if (!user)
      throw new ApiError(
        ERRORS.USER_NOT_FOUND.message,
        ERRORS.USER_NOT_FOUND.statusCode
      );

    return await placeRepository.getList({
      adminId: userId,
      limit: 100,
      page: 1,
      order: OrderEnum.DESC,
      orderBy: "createdAt",
    });
  }

  public async getMyReviews(userId: string) {
    return await reviewService.getByUser(userId);
  }

  public async getMyRatings(userId: string) {
    const reviews = await reviewService.getByUser(userId);
    return reviews.filter((r) => r.rating > 0);
  }

  public async updateUser(userId: string, dto: Partial<IUser>): Promise<IUser> {
    const user = await userRepository.updateById(userId, dto);
    if (!user)
      throw new ApiError(
        ERRORS.USER_NOT_FOUND.message,
        ERRORS.USER_NOT_FOUND.statusCode
      );
    return user;
  }

  public async deleteUser(userId: string): Promise<void> {
    await userRepository.softDeleteById(userId);
  }

  public async changeRole(userId: string, role: RoleEnum): Promise<IUser> {
    const user = await userRepository.updateById(userId, { role });
    if (!user)
      throw new ApiError(
        ERRORS.USER_NOT_FOUND.message,
        ERRORS.USER_NOT_FOUND.statusCode
      );
    return user;
  }

  public async reassignEstablishment(
    placeId: string,
    newUserId: string
  ): Promise<IPlace | null> {
    // update createdBy for Place
    return await placeRepository.updateById(placeId, { createdBy: newUserId });
  }

  private async findUserOrThrow(
    userId: string,
    errMessage: string,
    errCode: number
  ): Promise<IUser> {
    const user = await userRepository.getById(userId);
    if (!user || user.isDeleted) {
      throw new ApiError(errMessage, errCode);
    }
    return user;
  }
}

export const userService = new UserService();
