import { FilterQuery, type PipelineStage, Types } from "mongoose";

import { ModerateOptionsEnum } from "../enums/moderate-options.enum";
import { PlaceListOrderEnum } from "../enums/place-list-order.enum";
import { normalizeToArray } from "../helpers/geo.helper";
import { IPlaceListQuery, IPlaceModel } from "../interfaces/place.interface";
import { Place } from "../models/place.model";

class PlaceRepository {
  public async getList(
    query: IPlaceListQuery,
    isModerated: ModerateOptionsEnum
  ): Promise<{ entities: IPlaceModel[]; total: number }> {
    const filterObj: FilterQuery<IPlaceModel> = {};

    if (isModerated === ModerateOptionsEnum.TRUE) {
      filterObj.isModerated = true;
    }
    if (isModerated === ModerateOptionsEnum.FALSE) {
      filterObj.isModerated = false;
    }

    if (query.name) {
      filterObj.name = { $regex: query.name, $options: "i" };
    }

    if (query.type) {
      filterObj.type = query.type;
    }

    if (query.rating) {
      filterObj.rating = { $gte: Number(query.rating) };
    }

    if (query.averageCheckMin || query.averageCheckMax) {
      filterObj.averageCheck = {};
      if (query.averageCheckMin)
        filterObj.averageCheck.$gte = Number(query.averageCheckMin);
      if (query.averageCheckMax)
        filterObj.averageCheck.$lte = Number(query.averageCheckMax);
    }

    if (query.tags) {
      const tagsArr = normalizeToArray(query.tags);
      if (tagsArr.length) filterObj.tags = { $in: tagsArr };
    }

    if (query.features) {
      const featuresArr = normalizeToArray(query.features);
      if (featuresArr.length) filterObj.features = { $all: featuresArr };
    }

    if (query.isModerated !== undefined) {
      filterObj.isModerated = query.isModerated === true;
    }

    if (query.isDeleted !== undefined) {
      filterObj.isDeleted = query.isDeleted === true;
    }

    if (query.adminId) {
      filterObj.createdBy = query.adminId as Types.ObjectId;
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = limit * (page - 1);

    const orderBy = String(query.orderBy || "createdAt");
    const order = query.order === "asc" ? 1 : -1;

    let textScoreSort = {};
    if (query.name) {
      filterObj.name = { $regex: query.name, $options: "i" };
      textScoreSort = {};
    }

    // I figured out that I can have an enormous amount of different queries for filtering
    // but only one query for sorting :)
    let entities: IPlaceModel[] = [];
    let total = 0;
    if (
      orderBy === PlaceListOrderEnum.DISTANCE &&
      query.latitude &&
      query.longitude
    ) {
      const geoQuery = [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [Number(query.longitude), Number(query.latitude)],
            },
            distanceField: "distance",
            spherical: true,
            query: filterObj,
          },
        },
        { $sort: { distance: order } },
        { $skip: skip },
        { $limit: limit },
      ] as PipelineStage[];

      entities = await Place.aggregate(geoQuery);
      total = await Place.countDocuments(filterObj);
    } else {
      const sortObj: Record<string, 1 | -1> = { [orderBy]: order };
      const finalSort = query.name ? { ...textScoreSort, ...sortObj } : sortObj;
      [entities, total] = await Promise.all([
        Place.find(filterObj).sort(finalSort).limit(limit).skip(skip),
        Place.countDocuments(filterObj),
      ]);
    }
    return { entities, total, ...query };
  }

  public async create(dto: Partial<IPlaceModel>): Promise<IPlaceModel> {
    return await Place.create(dto);
  }

  public async getById(
    placeId: Types.ObjectId | string
  ): Promise<IPlaceModel | null> {
    return await Place.findById(placeId);
  }

  public async getByIds(
    placeIds: (Types.ObjectId | string)[]
  ): Promise<IPlaceModel[]> {
    return await Place.find({
      _id: { $in: placeIds },
      isModerated: true,
    });
  }

  public async updateById(
    placeId: Types.ObjectId | string,
    dto: Partial<IPlaceModel>
  ): Promise<IPlaceModel | null> {
    return await Place.findByIdAndUpdate(placeId, dto, { new: true });
  }

  public async deleteById(placeId: Types.ObjectId | string): Promise<void> {
    await Place.findByIdAndDelete(placeId);
  }

  // public async addView(
  //   placeId: string,
  //   userId: string,
  //   date: Date
  // ): Promise<IPlace | null> {
  //   return await Place.findByIdAndUpdate(
  //     placeId,
  //     { $push: { views: { userId, date } } },
  //     { new: true }
  //   );
  // }
  //
  // public async getViewsStats(
  //   placeId: string,
  //   from: Date,
  //   to: Date
  // ): Promise<number> {
  //   const place = await Place.findById(placeId);
  //   if (!place || !place.views) return 0;
  //   return place.views.filter((v) => v.date >= from && v.date <= to).length;
  // }

  public async getAllTags(): Promise<string[]> {
    return await Place.distinct("tags", { isDeleted: false });
  }

  public async updatePhoto(
    placeId: Types.ObjectId | string,
    photoUrl: string
  ): Promise<IPlaceModel> {
    return await Place.findByIdAndUpdate(
      placeId,
      { photo: photoUrl },
      { new: true }
    );
  }
}

export const placeRepository = new PlaceRepository();
