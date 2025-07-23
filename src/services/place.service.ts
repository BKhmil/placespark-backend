// import { OrderEnum } from "../enums/order.enum";
import { RoleEnum } from "../enums/role.enum";
import { ApiError } from "../errors/api.error";
import {
  IPlace,
  IPlaceListQuery,
  IPlaceListResponseDto,
} from "../interfaces/place.interface";
import { ITokenPayload } from "../interfaces/token.interface";
import { placePresenter } from "../presenters/place.presenter";
import { placeRepository } from "../repositories/place.repository";
// import { reviewRepository } from "../repositories/review.repository";

class PlaceService {
  public async getList(query: IPlaceListQuery): Promise<IPlaceListResponseDto> {
    const { entities, total } = await placeRepository.getList(query);
    return placePresenter.toResponseList(entities, total, query);
  }

  public async getById(placeId: string): Promise<IPlace | null> {
    return await placeRepository.getById(placeId);
  }

  public async create(dto: Partial<IPlace>): Promise<IPlace> {
    return await placeRepository.create(dto);
  }

  public async update(
    placeId: string,
    dto: Partial<IPlace>,
    tokenPayload: ITokenPayload
  ): Promise<IPlace | null> {
    const place = await this.placeExistsOrThrow(placeId);
    this.checkHasAccessOrThrow(
      tokenPayload.userId,
      tokenPayload.role,
      place.createdBy
    );
    return await placeRepository.updateById(placeId, dto);
  }

  // public async moderate(
  //   placeId: string,
  //   isModerated: boolean
  // ): Promise<IPlace | null> {
  //   void (await this.placeExistsOrThrow(placeId));
  //   return await placeRepository.updateById(placeId, { isModerated });
  // }

  public async delete(
    placeId: string,
    tokenPayload: ITokenPayload
  ): Promise<void> {
    const place = await this.placeExistsOrThrow(placeId);
    this.checkHasAccessOrThrow(
      tokenPayload.userId,
      tokenPayload.role,
      place.createdBy
    );
    await placeRepository.softDeleteById(placeId);
  }

  // public async addView(
  //   placeId: string,
  //   userId: string,
  //   date: Date
  // ): Promise<IPlace | null> {
  //   return await placeRepository.addView(placeId, userId, date);
  // }
  //
  // public async getViewsStats(
  //   placeId: string,
  //   from: Date,
  //   to: Date
  // ): Promise<number> {
  //   return await placeRepository.getViewsStats(placeId, from, to);
  // }
  //
  // public async getAnalytics() {
  //   const places = await placeRepository.getList({
  //     page: 1,
  //     limit: 10000,
  //     order: OrderEnum.DESC,
  //     orderBy: "createdAt",
  //   });
  //   const total = places.entities.length;
  //   let totalViews = 0;
  //   let totalRating = 0;
  //   let totalReviews = 0;
  //   for (const place of places.entities) {
  //     totalViews += place.views?.length || 0;
  //     totalRating += place.rating || 0;
  //     const reviews = await reviewRepository.getByPlace(place._id);
  //     totalReviews += reviews.length;
  //   }
  //   return {
  //     totalPlaces: total,
  //     totalViews,
  //     averageRating: total ? totalRating / total : 0,
  //     totalReviews,
  //   };
  // }

  public async getAllTags(): Promise<string[]> {
    return await placeRepository.getAllTags();
  }

  private async placeExistsOrThrow(placeId: string): Promise<IPlace> {
    const place = await placeRepository.getById(placeId);
    if (!place) {
      throw new ApiError("Place not found", 404);
    }

    return place;
  }

  private checkHasAccessOrThrow(
    userId: string,
    role: string,
    placeUserId: string
  ) {
    if (role === RoleEnum.SUPERADMIN) {
      return;
    }
    if (userId !== placeUserId.toString()) {
      throw new ApiError("You are not allowed to access this place", 403);
    }
  }
}

export const placeService = new PlaceService();
