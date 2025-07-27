import { Types } from "mongoose";

import { ModerateOptionsEnum } from "../enums/moderate-options.enum";
import { RoleEnum } from "../enums/role.enum";
import { ApiError } from "../errors/api.error";
import {
  deleteFile,
  deleteFolder,
  getCloudinaryPublicId,
} from "../helpers/cloudinary.helper";
import { idsEqual } from "../helpers/equals.helper";
import { toGeoJSON } from "../helpers/location.helpers";
import {
  IPlace,
  IPlaceListQuery,
  IPlaceListResponseDto,
  IPlaceModel,
  IPlaceResponseDto,
} from "../interfaces/place.interface";
import { ITokenPayload } from "../interfaces/token.interface";
import { placePresenter } from "../presenters/place.presenter";
import { placeRepository } from "../repositories/place.repository";
import { userRepository } from "../repositories/user.repository";

class PlaceService {
  public async getList(query: IPlaceListQuery): Promise<IPlaceListResponseDto> {
    const { entities, total } = await placeRepository.getList(
      query,
      ModerateOptionsEnum.TRUE
    );
    return placePresenter.toResponseList(entities, total, query);
  }

  public async getById(
    placeId: Types.ObjectId | string
  ): Promise<IPlaceResponseDto | null> {
    const place = await this.placeExistsOrThrow(placeId);
    return placePresenter.toResponse(place);
  }

  public async create(
    dto: Partial<IPlace>,
    userId: Types.ObjectId | string
  ): Promise<IPlaceResponseDto> {
    const place = await placeRepository.create({
      ...dto,
      location: toGeoJSON(dto.location),
      createdBy: userId as Types.ObjectId,
    });

    // at the time I was thinking about several ways to inform client about new record on <user.admin_establishments>
    //#1: it's obvious that if we don't get an error on client after request that means we've added it successfully so we can just update local client state
    //#2: we can return the place with the <user>, but it's not a good idea because REST principles say that we should return only what we've asked for
    //#3: final decision, after successful request we just make a new request from client to /api/user/me to get the updated user
    await userRepository.addAdminEstablishment(userId, place._id);
    return placePresenter.toResponse(place);
  }

  public async updatePhoto(
    placeId: Types.ObjectId | string,
    file: Express.Multer.File
  ) {
    try {
      const place = await this.placeExistsOrThrow(placeId);

      const oldPhotoUrl = place?.photo;
      let oldPublicId: string | null = null;

      if (oldPhotoUrl) {
        oldPublicId = getCloudinaryPublicId(oldPhotoUrl);
        if (oldPublicId) {
          try {
            await deleteFile(oldPublicId);
          } catch (deleteError) {
            console.warn("Failed to delete old place photo:", deleteError);
          }
        }
      }

      const updatedPlace = await placeRepository.updatePhoto(
        placeId,
        file.path
      );

      return placePresenter.toResponse(updatedPlace);
    } catch (err) {
      const newPublicId = getCloudinaryPublicId(file.path);
      if (newPublicId) {
        try {
          await deleteFile(newPublicId);
        } catch (deleteError) {
          console.warn(
            "Failed to delete new place photo after error:",
            deleteError
          );
        }
      }

      throw new ApiError(
        err.message ? err.message : "Server error",
        (err as ApiError).statusCode ? (err as ApiError).statusCode : 500
      );
    }
  }

  public async update(
    placeId: Types.ObjectId | string,
    dto: Partial<IPlace>,
    tokenPayload: ITokenPayload
  ): Promise<IPlaceResponseDto | null> {
    const place = await this.placeExistsOrThrow(placeId);
    this.checkHasAccessOrThrow(
      tokenPayload.role,
      tokenPayload.userId,
      place.createdBy
    );

    if (dto.location) {
      (dto as unknown as Partial<IPlaceModel>).location = toGeoJSON(
        dto.location
      );
    }

    return placePresenter.toResponse(
      await placeRepository.updateById(
        place._id,
        dto as unknown as Partial<IPlaceModel>
      )
    );
  }

  // public async moderate(
  //   placeId: string,
  //   isModerated: boolean
  // ): Promise<IPlace | null> {
  //   await this.placeExistsOrThrow(placeId);
  //   return await placeRepository.updateById(placeId, { isModerated });
  // }

  public async delete(
    placeId: Types.ObjectId | string,
    tokenPayload: ITokenPayload
  ): Promise<void> {
    const place = await this.placeExistsOrThrow(placeId);

    this.checkHasAccessOrThrow(
      tokenPayload.role,
      tokenPayload.userId,
      place.createdBy
    );

    try {
      await deleteFolder(`placespark/places/${placeId}`);
    } catch (deleteError) {
      console.warn(
        "Failed to delete place folder from Cloudinary:",
        deleteError
      );
    }

    await placeRepository.updateById(placeId, { photo: "" });
    await placeRepository.deleteById(placeId);
    await userRepository.removeAdminEstablishment(place.createdBy, placeId);
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

  public async placeExistsOrThrow(placeId: Types.ObjectId | string) {
    const place = await placeRepository.getById(placeId);
    if (!place) throw new ApiError("Place not found", 404);
    return place;
  }

  private checkHasAccessOrThrow(
    role: string,
    userId: Types.ObjectId | string,
    placeUserId: Types.ObjectId | string //createdBy
  ): void {
    if (role === RoleEnum.SUPERADMIN) {
      return;
    }

    if (!idsEqual(userId, placeUserId)) {
      throw new ApiError("You are not allowed to access this place", 403);
    }
  }
}

export const placeService = new PlaceService();
