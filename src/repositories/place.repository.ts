import { FilterQuery, type PipelineStage } from "mongoose";

import { PlaceListOrderEnum } from "../enums/place-list-order.enum";
import { normalizeToArray } from "../helpers/normalize-to-array";
import { IPlace, IPlaceListQuery } from "../interfaces/place.interface";
import { Place } from "../models/place.model";

class PlaceRepository {
  public async getList(
    query: IPlaceListQuery
  ): Promise<{ entities: IPlace[]; total: number }> {
    const filterObj: FilterQuery<IPlace> = { isDeleted: false };

    filterObj.isModerated = true;

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
      filterObj.createdBy = query.adminId;
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
    let entities: IPlace[] = [];
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

  public async create(dto: Partial<IPlace>): Promise<IPlace> {
    return await Place.create(dto);
  }

  public async getById(placeId: string): Promise<IPlace | null> {
    return await Place.findById(placeId);
  }

  public async updateById(
    placeId: string,
    dto: Partial<IPlace>
  ): Promise<IPlace | null> {
    return await Place.findByIdAndUpdate(placeId, dto, { new: true });
  }

  public async softDeleteById(placeId: string): Promise<void> {
    await Place.findByIdAndUpdate(placeId, { isDeleted: true });
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
}

export const placeRepository = new PlaceRepository();
