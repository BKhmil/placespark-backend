import { IPlaceModel } from "../interfaces/place.interface";

export const hasToObject = (
  doc: unknown
): doc is { toObject: () => IPlaceModel } => {
  return (
    typeof doc === "object" &&
    doc !== null &&
    typeof (doc as { toObject?: unknown }).toObject === "function"
  );
};
