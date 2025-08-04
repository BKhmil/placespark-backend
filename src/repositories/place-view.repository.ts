import { Types } from "mongoose";

import { IPlaceView } from "../interfaces/place-view.interface";
import { PlaceView } from "../models/place-view.model";

class PlaceViewRepository {
  public async addView(
    placeId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<IPlaceView> {
    const existing = await PlaceView.findOne({ placeId, userId });
    if (existing) return existing;
    return await PlaceView.create({ placeId, userId, date: new Date() });
  }

  public async getStats(
    placeId: Types.ObjectId | string,
    from: Date,
    to: Date
  ): Promise<IPlaceView[]> {
    return await PlaceView.find({
      placeId,
      date: { $gte: from, $lte: to },
    });
  }
}

export const placeViewRepository = new PlaceViewRepository();
