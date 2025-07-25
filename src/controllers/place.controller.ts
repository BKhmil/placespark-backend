import { NextFunction, Request, Response } from "express";

import { SUCCESS_CODES } from "../constants/success-codes.constant";
// import { OrderEnum } from "../enums/order.enum";
import {
  IPlaceCreate,
  IPlaceListQuery,
  IPlaceUpdate,
} from "../interfaces/place.interface";
import { ITokenPayload } from "../interfaces/token.interface";
import { placeService } from "../services/place.service";

class PlaceController {
  public async getList(req: Request, res: Response, next: NextFunction) {
    try {
      // const query = {
      //   ...req.query,
      //   isModerated: true,
      //   page: Number(req.query.page) || 1,
      //   limit: Number(req.query.limit) || 10,
      //   order: (typeof req.query.order === "string" &&
      //   Object.values(OrderEnum).includes(req.query.order as OrderEnum)
      //     ? req.query.order
      //     : "desc") as OrderEnum,
      //   orderBy:
      //     typeof req.query.orderBy === "string"
      //       ? req.query.orderBy
      //       : "createdAt",
      // };
      const query = req.query as unknown as IPlaceListQuery;
      const result = await placeService.getList(query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const placeId = req.params.placeId;
      const result = await placeService.getById(placeId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as IPlaceCreate;
      const result = await placeService.create(dto);
      res.status(SUCCESS_CODES.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const placeId = req.params.placeId;
      const dto = req.body as IPlaceUpdate;
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      const result = await placeService.update(placeId, dto, tokenPayload);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const placeId = req.params.placeId;
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      await placeService.delete(placeId, tokenPayload);
      res.sendStatus(SUCCESS_CODES.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }

  // public async getUnmoderated(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const query = {
  //       ...req.query,
  //       isModerated: false,
  //       page: Number(req.query.page) || 1,
  //       limit: Number(req.query.limit) || 10,
  //       order: (typeof req.query.order === "string" &&
  //       Object.values(OrderEnum).includes(req.query.order as OrderEnum)
  //         ? req.query.order
  //         : "desc") as OrderEnum,
  //       orderBy:
  //         typeof req.query.orderBy === "string"
  //           ? req.query.orderBy
  //           : "createdAt",
  //     };
  //     const result = await placeService.getList(query);
  //     res.json(result);
  //   } catch (err) {
  //     next(err);
  //   }
  // }
  //
  // public async moderate(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { placeId } = req.params;
  //     const { isModerated } = req.body;
  //     const result = await placeService.moderate(placeId, isModerated);
  //     res.json(result);
  //   } catch (err) {
  //     next(err);
  //   }
  // }
  //
  // public async addView(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { placeId } = req.params;
  //     const userId = req.res.locals.tokenPayload?.userId || "anonymous";
  //     const date = new Date();
  //     const result = await placeService.addView(placeId, userId, date);
  //     res.json(result);
  //   } catch (err) {
  //     next(err);
  //   }
  // }
  //
  // public async getViewsStats(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { placeId } = req.params;
  //     const { from, to } = req.query;
  //     const fromDate = from ? new Date(String(from)) : new Date(0);
  //     const toDate = to ? new Date(String(to)) : new Date();
  //     const result = await placeService.getViewsStats(
  //       placeId,
  //       fromDate,
  //       toDate
  //     );
  //     res.json({ count: result });
  //   } catch (err) {
  //     next(err);
  //   }
  // }
  //
  // public async getAnalytics(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const analytics = await placeService.getAnalytics();
  //     res.json(analytics);
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  public async getAllTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await placeService.getAllTags();
      res.json({ tags });
    } catch (err) {
      next(err);
    }
  }
}

export const placeController = new PlaceController();
