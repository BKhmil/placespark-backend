import { v2 as cloudinary } from "cloudinary";
import { NextFunction, Response } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import { envConfig } from "../configs/env.config";
import { ERRORS } from "../constants/errors.constant";
import { ApiError } from "../errors/api.error";
import { MulterRequest } from "../interfaces/multer-request.interface";

class FileUploadMiddleware {
  private cloudinary = cloudinary;
  private usersStorage = new CloudinaryStorage({
    cloudinary,
    params: (req) => ({
      folder: `placespark/users/${req.params.userId}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ quality: "auto" }],
    }),
  });
  private placesStorage = new CloudinaryStorage({
    cloudinary,
    params: (req) => ({
      folder: `placespark/places/${req.params.placeId}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ quality: "auto" }],
    }),
  });
  private newsStorage = new CloudinaryStorage({
    cloudinary,
    params: (req) => {
      return {
        folder: `placespark/places/${req.params.placeId}/news/${req.params.newsId}`,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ quality: "auto" }],
      };
    },
  });

  constructor() {
    this.cloudinary.config({
      cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
      api_key: envConfig.CLOUDINARY_API_KEY,
      api_secret: envConfig.CLOUDINARY_API_SECRET,
    });
  }

  public uploadUsersPhoto() {
    return multer({
      storage: this.usersStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
    });
  }

  public uploadPlacesPhoto() {
    return multer({
      storage: this.placesStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
    });
  }

  public uploadNewsPhoto() {
    return multer({
      storage: this.newsStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
    });
  }

  public async checkFile(
    req: MulterRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.file || !req.file.buffer) {
        throw new ApiError(
          ERRORS.NO_FILE_UPLOADED.message,
          ERRORS.NO_FILE_UPLOADED.statusCode
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  }
}

export const fileUploadMiddleware = new FileUploadMiddleware();
