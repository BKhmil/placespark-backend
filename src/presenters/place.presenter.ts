import { fromGeoJSON } from "../helpers/location.helpers";
import {
  IPlaceListQuery,
  IPlaceListResponseDto,
  IPlaceModel,
  IPlaceResponseDto,
  IPlaceResponseWithViewsCountDto,
} from "../interfaces/place.interface";

class PlacePresenter {
  public toResponse(entity: IPlaceModel): IPlaceResponseDto {
    return {
      _id: entity._id,
      name: entity.name,
      description: entity.description,
      address: entity.address,
      location: fromGeoJSON(entity.location),
      photo: entity.photo,
      tags: entity.tags,
      type: entity.type,
      features: entity.features,
      averageCheck: entity.averageCheck,
      rating: entity.rating,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      contacts: entity.contacts,
      workingHours: entity.workingHours,
      isModerated: entity.isModerated,
    };
  }
  public toResponseWithViewsCount(
    entity: IPlaceModel & { viewsCount: number }
  ): IPlaceResponseWithViewsCountDto {
    return {
      _id: entity._id,
      name: entity.name,
      description: entity.description,
      address: entity.address,
      location: fromGeoJSON(entity.location),
      photo: entity.photo,
      tags: entity.tags,
      type: entity.type,
      features: entity.features,
      averageCheck: entity.averageCheck,
      rating: entity.rating,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      contacts: entity.contacts,
      viewsCount: entity.viewsCount,
      workingHours: entity.workingHours,
      isModerated: entity.isModerated,
    };
  }

  public toResponseList(
    entities: IPlaceModel[],
    total: number,
    query: IPlaceListQuery
  ): IPlaceListResponseDto {
    return {
      data: entities.map(this.toResponse),
      total,
      ...query,
    };
  }

  public toResponseArray(entities: IPlaceModel[]): IPlaceResponseDto[] {
    return entities.map(this.toResponse);
  }
}

export const placePresenter = new PlacePresenter();

// todo: add presenters for other models
