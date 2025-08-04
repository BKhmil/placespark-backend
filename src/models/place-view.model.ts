import { model, Schema } from "mongoose";

import { IPlaceView } from "../interfaces/place-view.interface";

const placeViewSchema = new Schema<IPlaceView>({
  placeId: { type: Schema.Types.ObjectId, required: true, ref: "places" },
  userId: { type: Schema.Types.ObjectId, required: true, ref: "users" },
  date: { type: Date, default: Date.now },
});

export const PlaceView = model<IPlaceView>("place_views", placeViewSchema);
