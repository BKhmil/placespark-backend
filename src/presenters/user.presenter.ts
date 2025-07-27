import {
  IUser,
  IUserListQuery,
  IUserListResponseDto,
  IUserResponseDto,
} from "../interfaces/user.interface";

class UserPresenter {
  public toResponse(entity: IUser): IUserResponseDto {
    return {
      _id: entity._id,
      name: entity.name,
      email: entity.email,
      isVerified: entity.isVerified,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      role: entity.role,
      admin_establishments: entity.admin_establishments,
      favorites: entity.favorites,
      photo: entity.photo || "",
    };
  }

  public toResponseList(
    entities: IUser[],
    total: number,
    query: IUserListQuery
  ): IUserListResponseDto {
    return {
      data: entities.map(this.toResponse),
      total,
      ...query,
    };
  }
}

export const userPresenter = new UserPresenter();
