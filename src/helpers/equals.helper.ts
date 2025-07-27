import { Types } from "mongoose";

export const idsEqual = (
  a: Types.ObjectId | string,
  b: Types.ObjectId | string
): boolean => {
  if (a instanceof Types.ObjectId) {
    return a.equals(b);
  }
  if (b instanceof Types.ObjectId) {
    return b.equals(a);
  }
  return a === b;
};
