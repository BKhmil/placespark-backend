import { NextFunction, Request, Response } from "express";

import { SUCCESS_CODES } from "../constants/success-codes.constant";
import { ITokenPayload } from "../interfaces/token.interface";
import { reviewService } from "../services/review.service";

class ReviewController {
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { placeId } = req.params;
      const dto = req.body;
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      const result = await reviewService.create(placeId, dto, tokenPayload);
      res.status(SUCCESS_CODES.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { placeId, reviewId } = req.params;
      const dto = req.body;
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      const result = await reviewService.update(
        placeId,
        reviewId,
        dto,
        tokenPayload
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { placeId, reviewId } = req.params;
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      await reviewService.delete(placeId, reviewId, tokenPayload);
      res.sendStatus(SUCCESS_CODES.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }
}

export const reviewController = new ReviewController();
