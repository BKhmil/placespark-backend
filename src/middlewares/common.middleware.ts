import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";
import { isObjectIdOrHexString } from "mongoose";

import { ERRORS } from "../constants/errors.constant";
import { ApiError } from "../errors/api.error";

class CommonMiddleware {
  public isIdValid(key: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = req.params[key];
        if (!isObjectIdOrHexString(id)) {
          throw new ApiError(
            ERRORS.INVALID_ID.message,
            ERRORS.INVALID_ID.statusCode
          );
        }
        next();
      } catch (err) {
        next(err);
      }
    };
  }

  public validateBody(validator: ObjectSchema) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.body || !Object.keys(req.body).length) {
          throw new ApiError(
            ERRORS.EMPTY_BODY.message,
            ERRORS.EMPTY_BODY.statusCode
          );
        }

        req.body = await validator.validateAsync(req.body);
        next();
      } catch (err) {
        if (err.isJoi) {
          next(
            new ApiError(
              err.details[0].message,
              ERRORS.VALIDATION_ERROR.statusCode
            )
          );
        } else {
          next(err);
        }
      }
    };
  }

  public validateQuery(validator: ObjectSchema) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const value = await validator.validateAsync(req.query);
        Object.assign(req.query, value);
        next();
      } catch (err) {
        if (err.isJoi) {
          next(
            new ApiError(
              err.details[0].message,
              ERRORS.VALIDATION_ERROR.statusCode
            )
          );
        } else {
          next(err);
        }
      }
    };
  }
}

export const commonMiddleware = new CommonMiddleware();
