import { NextFunction, Request, Response } from "express";

import { SUCCESS_CODES } from "../constants/success-codes.constant";
import { MulterRequest } from "../interfaces/multer-request.interface";
import { INewsCreate, INewsUpdate } from "../interfaces/news.interface";
import { ITokenPayload } from "../interfaces/token.interface";
import { newsService } from "../services/news.service";

class NewsController {
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tokenPayload = res.locals.tokenPayload as ITokenPayload;
      const dto = req.body as INewsCreate;
      dto.placeId = req.params.placeId;
      const news = await newsService.create(dto, tokenPayload);
      res.status(SUCCESS_CODES.CREATED).json(news);
    } catch (err) {
      next(err);
    }
  }

  public async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tokenPayload = res.locals.tokenPayload as ITokenPayload;
      const dto = req.body as INewsUpdate;
      const newsId = req.params.newsId;
      const placeId = req.params.placeId;
      const news = await newsService.update(newsId, placeId, dto, tokenPayload);
      res.json(news);
    } catch (err) {
      next(err);
    }
  }

  public async updatePhoto(
    req: MulterRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tokenPayload = res.locals.tokenPayload as ITokenPayload;
      const newsId = req.params.newsId;
      const placeId = req.params.placeId;
      const updated = await newsService.updatePhoto(
        newsId,
        placeId,
        req.file,
        tokenPayload
      );
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  public async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tokenPayload = res.locals.tokenPayload as ITokenPayload;
      const newsId = req.params.newsId;
      const placeId = req.params.placeId;
      await newsService.delete(newsId, placeId, tokenPayload);
      res.sendStatus(SUCCESS_CODES.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }

  public async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const news = await newsService.getById(req.params.newsId);
      if (!news) {
        res.status(404).json({ message: "News not found" });
        return;
      }
      res.json(news);
    } catch (err) {
      next(err);
    }
  }

  public async getByPlaceId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const placeId = req.params.placeId;
      const { type, page, limit } = req.query;

      const pageNum = page ? parseInt(page as string) : 1;
      const limitNum = limit ? parseInt(limit as string) : 10;

      const result = await newsService.getByPlaceId(
        placeId,
        type as string,
        pageNum,
        limitNum
      );

      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // public async getByPlaceId(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const news = await newsService.getByPlaceId(req.params.placeId);
  //     res.json(news);
  //   } catch (err) {
  //     next(err);
  //   }
  // }
}

export const newsController = new NewsController();
