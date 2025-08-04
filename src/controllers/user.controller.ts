import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

import { SUCCESS_CODES } from "../constants/success-codes.constant";
import { MulterRequest } from "../interfaces/multer-request.interface";
import { IPlaceListQuery } from "../interfaces/place.interface";
import { ITokenPayload } from "../interfaces/token.interface";
import {
  IUserListQuery,
  IUserUpdateRequestDto,
} from "../interfaces/user.interface";
import { userService } from "../services/user.service";

class UserController {
  public async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as IUserListQuery;
      const result = await userService.getList(query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      const result = await userService.getMe(tokenPayload);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      const dto = req.body as IUserUpdateRequestDto;
      const result = await userService.updateMe(tokenPayload, dto);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async deleteMe(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      await userService.deleteMe(tokenPayload);
      res.sendStatus(SUCCESS_CODES.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }

  public async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;
      const result = await userService.getUserById(userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async addFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      const placeId = req.body.placeId as Types.ObjectId | string;
      const result = await userService.addFavorite(
        tokenPayload.userId,
        placeId
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async removeFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      const placeId = req.body.placeId as Types.ObjectId | string;
      const result = await userService.removeFavorite(
        tokenPayload.userId,
        placeId
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async getMyEstablishments(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const query = req.query as unknown as IPlaceListQuery;
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      const result = await userService.getMyEstablishments(tokenPayload, query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as IUserListQuery;
      const result = await userService.getList(query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const dto = req.body;
      const result = await userService.updateUser(userId, dto);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      await userService.deleteUser(userId);
      res.sendStatus(SUCCESS_CODES.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }

  // public async changeRole(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { userId } = req.params;
  //     const { role } = req.body;
  //     const result = await userService.changeRole(userId, role as RoleEnum);
  //     res.json(result);
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  public async updatePhoto(
    req: MulterRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.params.userId;
      const file = req.file;
      const updated = await userService.updatePhoto(userId, file);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  public async getMyReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      const result = await userService.getMyReviews(tokenPayload);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async getMyFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      const result = await userService.getMyFavorites(tokenPayload);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
