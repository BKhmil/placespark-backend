import { NextFunction, Request, Response } from "express";

import { ERRORS } from "../constants/errors.constant";
import { SUCCESS_CODES } from "../constants/success-codes.constant";
import { ApiError } from "../errors/api.error";
import { ITokenPayload } from "../interfaces/token.interface";
import {
  IAccountRestoreRequestDto,
  IAccountRestoreSetRequestDto,
  IChangePasswordRequestDto,
  IForgotPasswordRequestDto,
  IForgotPasswordSetRequestDto,
  ISignInRequestDto,
  ISignUpRequestDto,
} from "../interfaces/user.interface";
import { authService } from "../services/auth.service";

class AuthController {
  public async ping(req: Request, res: Response, next: NextFunction) {
    try {
      res.sendStatus(SUCCESS_CODES.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }

  public async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const isDeleted = req.res.locals.isDeleted as boolean;

      if (isDeleted) {
        // for restoring account -  POST: /api/auth/restore-account
        res.json({ canRestore: true });
      } else {
        const dto = req.body as ISignUpRequestDto;
        const result = await authService.signUp(dto);
        res.status(SUCCESS_CODES.CREATED).json(result);
      }
    } catch (err) {
      next(err);
    }
  }

  public async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const isDeleted = req.res.locals.isDeleted as boolean;

      if (isDeleted) {
        throw new ApiError(
          ERRORS.USER_NOT_FOUND.message,
          ERRORS.USER_NOT_FOUND.statusCode
        );
      } else {
        const dto = req.body as ISignInRequestDto;
        const result = await authService.signIn(dto);
        res.status(SUCCESS_CODES.CREATED).json(result);
      }
    } catch (err) {
      next(err);
    }
  }

  public async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      const refreshToken = req.res.locals.refreshToken as string;
      const result = await authService.refresh(tokenPayload, refreshToken);
      res.status(SUCCESS_CODES.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  }

  public async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      const accessToken = req.res.locals.accessToken as string;
      await authService.logout(accessToken, tokenPayload);
      res.sendStatus(SUCCESS_CODES.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }

  public async logoutAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      await authService.logoutAll(tokenPayload);
      res.sendStatus(SUCCESS_CODES.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }

  public async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as IForgotPasswordRequestDto;
      await authService.forgotPassword(dto);
      res.sendStatus(SUCCESS_CODES.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }

  public async forgotPasswordSet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const dto = req.body as IForgotPasswordSetRequestDto;
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      await authService.forgotPasswordSet(dto, tokenPayload);
      res.sendStatus(SUCCESS_CODES.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }

  public async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      await authService.verify(tokenPayload);
      res.sendStatus(SUCCESS_CODES.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }

  public async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as IChangePasswordRequestDto;
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      await authService.changePassword(dto, tokenPayload);
      res.sendStatus(SUCCESS_CODES.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }

  public async accountRestore(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as IAccountRestoreRequestDto;
      await authService.accountRestore(dto);
      res.sendStatus(SUCCESS_CODES.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }

  public async accountRestoreSet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const dto = req.body as IAccountRestoreSetRequestDto;
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      await authService.accountRestoreSet(dto, tokenPayload);
      res.sendStatus(SUCCESS_CODES.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }

  public async resendVerifyEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;
      await authService.resendVerifyEmail(tokenPayload);
      res.sendStatus(SUCCESS_CODES.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
