import { Types } from "mongoose";

import { ERRORS } from "../constants/errors.constant";
import { RoleEnum } from "../enums/role.enum";
import { ApiError } from "../errors/api.error";
import { idsEqual } from "../helpers/equals.helper";
import { INews, INewsCreate, INewsUpdate } from "../interfaces/news.interface";
import { IPlaceModel } from "../interfaces/place.interface";
import { ITokenPayload } from "../interfaces/token.interface";
import { newsRepository } from "../repositories/news.repository";
import { placeRepository } from "../repositories/place.repository";

class NewsService {
  public async create(
    dto: INewsCreate,
    tokenPayload: ITokenPayload
  ): Promise<INews> {
    // I should check if:
    // place exists
    // place is moderated
    // user has access to the place
    const place = await this.isPlaceModerated(dto.placeId);
    this.checkHasAccessOrThrow(
      tokenPayload.role,
      tokenPayload.userId,
      place.createdBy
    );
    return await newsRepository.create(dto);
  }

  public async update(
    newsId: Types.ObjectId | string,
    placeId: Types.ObjectId | string,
    dto: INewsUpdate,
    tokenPayload: ITokenPayload
  ): Promise<INews> {
    const place = await this.isPlaceModerated(placeId);
    const news = await this.newsExistsOrThrow(newsId);

    this.checkNewsBelongsToPlaceOrThrow(placeId, news.placeId);

    this.checkHasAccessOrThrow(
      tokenPayload.role,
      tokenPayload.userId,
      place.createdBy
    );

    return await newsRepository.updateById(newsId, dto);
  }

  public async getById(newsId: Types.ObjectId | string): Promise<INews | null> {
    return await newsRepository.getById(newsId);
  }

  // public async getByPlaceId(
  //   placeId: Types.ObjectId | string
  // ): Promise<INews[]> {
  //   return await newsRepository.getByPlaceId(placeId);
  // }

  public async updatePhoto(
    newsId: Types.ObjectId | string,
    placeId: Types.ObjectId | string,
    file: Express.Multer.File,
    tokenPayload: ITokenPayload
  ) {
    const place = await this.isPlaceModerated(placeId);
    const news = await this.newsExistsOrThrow(newsId);

    this.checkNewsBelongsToPlaceOrThrow(placeId, news.placeId);

    this.checkHasAccessOrThrow(
      tokenPayload.role,
      tokenPayload.userId,
      place.createdBy
    );

    try {
      const oldPhotoUrl = news?.photo;
      let oldPublicId: string | null = null;

      if (oldPhotoUrl) {
        const { getCloudinaryPublicId, deleteFile } = await import(
          "../helpers/cloudinary.helper"
        );
        oldPublicId = getCloudinaryPublicId(oldPhotoUrl);
        if (oldPublicId) {
          try {
            await deleteFile(oldPublicId);
          } catch (deleteError) {
            console.warn("Failed to delete old news photo:", deleteError);
          }
        }
      }

      const updatedNews = await newsRepository.updatePhoto(newsId, file.path);
      return updatedNews;
    } catch (err) {
      const { getCloudinaryPublicId, deleteFile } = await import(
        "../helpers/cloudinary.helper"
      );
      const newPublicId = getCloudinaryPublicId(file.path);
      if (newPublicId) {
        try {
          await deleteFile(newPublicId);
        } catch (deleteError) {
          console.warn(
            "Failed to delete new news photo after error:",
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

  public async delete(
    newsId: Types.ObjectId | string,
    placeId: Types.ObjectId | string,
    tokenPayload: ITokenPayload
  ): Promise<void> {
    const place = await this.isPlaceModerated(placeId);
    const news = await this.newsExistsOrThrow(newsId);

    this.checkNewsBelongsToPlaceOrThrow(placeId, news.placeId);

    this.checkHasAccessOrThrow(
      tokenPayload.role,
      tokenPayload.userId,
      place.createdBy
    );

    if (news.photo) {
      try {
        const { getCloudinaryPublicId, deleteFile } = await import(
          "../helpers/cloudinary.helper"
        );
        const publicId = getCloudinaryPublicId(news.photo);
        if (publicId) {
          await deleteFile(publicId);
        }
      } catch (deleteError) {
        console.warn(
          "Failed to delete news photo from Cloudinary:",
          deleteError
        );
      }
    }

    await newsRepository.deleteById(newsId);
  }

  public async newsExistsOrThrow(newsId: Types.ObjectId | string) {
    const news = await newsRepository.getById(newsId);
    if (!news) throw new ApiError("News not found", 404);
    return news;
  }

  private async isPlaceModerated(
    placeId: Types.ObjectId | string
  ): Promise<IPlaceModel> {
    const place = await placeRepository.getById(placeId);
    if (!place)
      throw new ApiError(ERRORS.NOT_FOUND.message, ERRORS.NOT_FOUND.statusCode);

    if (!place.isModerated) {
      throw new ApiError("You cannot add news to an unmoderated place", 403);
    }

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

  private checkNewsBelongsToPlaceOrThrow(
    placeId: Types.ObjectId | string,
    newsPlaceId: Types.ObjectId | string // news.placeId
  ): void {
    if (!idsEqual(placeId, newsPlaceId)) {
      throw new ApiError("You are not allowed to access this news", 403);
    }
  }
}

export const newsService = new NewsService();
