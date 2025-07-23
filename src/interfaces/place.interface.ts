import { OrderEnum } from "../enums/order.enum";
import { PlaceTypeEnum } from "../enums/place-type.enum";

export interface IPlace {
  _id: string;
  name: string;
  description: string;
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  photo: string;
  tags: string[];
  type: PlaceTypeEnum;
  features: string[];
  averageCheck: number;
  rating: number;
  createdBy: string;
  isModerated: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  views?: { userId: string; date: Date }[];
  contacts?: {
    phone?: string;
    tg?: string;
    email?: string;
  };
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
>;

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
  adminId?: string;
  order: OrderEnum;
  orderBy: string;
  latitude?: number;
  longitude?: number;
};
