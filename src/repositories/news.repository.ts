import { Types } from "mongoose";

import { INews, INewsCreate, INewsUpdate } from "../interfaces/news.interface";
import { News } from "../models/news.model";

class NewsRepository {
  public async create(dto: INewsCreate): Promise<INews> {
    return await News.create(dto);
  }

  public async getById(newsId: Types.ObjectId | string): Promise<INews | null> {
    return await News.findById(newsId);
  }

  public async getByPlaceId(
    placeId: Types.ObjectId | string
  ): Promise<INews[]> {
    return await News.find({ placeId });
  }

  public async updateById(
    newsId: Types.ObjectId | string,
    dto: INewsUpdate
  ): Promise<INews | null> {
    return await News.findByIdAndUpdate(newsId, dto, { new: true });
  }

  public async updatePhoto(newsId: Types.ObjectId | string, photoUrl: string) {
    return await News.findByIdAndUpdate(
      newsId,
      { photo: photoUrl },
      { new: true }
    );
  }

  public async deleteById(
    newsId: Types.ObjectId | string
  ): Promise<INews | null> {
    return await News.findByIdAndDelete(newsId);
  }
}

export const newsRepository = new NewsRepository();
