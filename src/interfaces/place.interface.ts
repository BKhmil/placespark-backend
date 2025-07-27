import { Types } from "mongoose";

import { OrderEnum } from "../enums/order.enum";
import { PlaceTypeEnum } from "../enums/place-type.enum";
import { PlaceWorkingDayEnum } from "../enums/place-working-day.enum";

export interface IWorkingHour {
  day: PlaceWorkingDayEnum;
  from?: string;
  to?: string;
  closed?: boolean;
}

export interface IPlace {
  _id: Types.ObjectId | string;
  name: string;
  description: string;
  address: string;
  location: {
    lng: number;
    lat: number;
  };
  photo: string;
  tags: string[];
  type: PlaceTypeEnum;
  features: string[];
  averageCheck: number;
  rating: number;
  createdBy: Types.ObjectId | string;
  isModerated: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  views?: { userId: Types.ObjectId | string; date: Date }[];
  contacts?: {
    phone?: string;
    tg?: string;
    email?: string;
  };
  workingHours?: IWorkingHour[];
}

export interface IPlaceModel {
  _id: Types.ObjectId | string;
  name: string;
  description: string;
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  photo: string;
  tags: string[];
  type: PlaceTypeEnum;
  features: string[];
  averageCheck: number;
  rating: number;
  createdBy: Types.ObjectId | string;
  isModerated: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  views?: { userId: Types.ObjectId | string; date: Date }[];
  contacts?: {
    phone?: string;
    tg?: string;
    email?: string;
  };
  workingHours?: IWorkingHour[];
}

export type IPlaceResponseDto = Pick<
  IPlace,
  | "_id"
  | "name"
  | "description"
  | "address"
  | "location"
  | "photo"
  | "tags"
  | "type"
  | "features"
  | "averageCheck"
  | "rating"
  | "createdBy"
  | "createdAt"
  | "updatedAt"
  | "views"
  | "contacts"
  | "workingHours"
  | "isModerated"
>;

export interface IPlaceListResponseDto extends IPlaceListQuery {
  data: IPlaceResponseDto[];
  total: number;
}

export type IPlaceCreate = Omit<
  IPlace,
  | "createdBy"
  | "isModerated"
  | "isDeleted"
  | "createdAt"
  | "updatedAt"
  | "views"
> & {
  location: {
    lng: number;
    lat: number;
  };
};

export type IPlaceUpdate = Omit<
  IPlace,
  | "createdBy"
  | "isModerated"
  | "isDeleted"
  | "createdAt"
  | "updatedAt"
  | "views"
>;

export type IPlaceListQuery = {
  page: number;
  limit: number;
  name?: string;
  type?: PlaceTypeEnum | string;
  rating?: number;
  averageCheckMin?: number;
  averageCheckMax?: number;
  tags?: string[];
  features?: string[];
  isModerated?: boolean;
  isDeleted?: boolean;
  adminId?: Types.ObjectId | string;
  order: OrderEnum;
  orderBy: string;
  latitude?: number;
  longitude?: number;
};
