import * as jwt from "jsonwebtoken";
import ms from "ms";

import { envConfig } from "../configs/env.config";
import { ERRORS } from "../constants/errors.constant";
import { ActionTokenTypeEnum } from "../enums/action-token-type.enum";
import { TokenTypeEnum } from "../enums/token-type.enum";
import { ApiError } from "../errors/api.error";
import { ITokenPair, ITokenPayload } from "../interfaces/token.interface";

class TokenService {
  public generateTokens(payload: ITokenPayload): ITokenPair {
    const accessToken = jwt.sign(payload, envConfig.JWT_ACCESS_SECRET, {
      expiresIn: envConfig.JWT_ACCESS_EXPIRATION as ms.StringValue,
    });
    //               For some reason, it doesn't work without explicitly casting to <ms.StringValue>,
    //               whereas it used to work before
    const refreshToken = jwt.sign(payload, envConfig.JWT_REFRESH_SECRET, {
      expiresIn: envConfig.JWT_REFRESH_EXPIRATION as ms.StringValue,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  public generateActionToken(
    payload: ITokenPayload,
    type: ActionTokenTypeEnum
  ): string {
    let secret: string;
    let expiresIn: string;

    switch (type) {
      case ActionTokenTypeEnum.FORGOT_PASSWORD:
        secret = envConfig.ACTION_FORGOT_PASSWORD_SECRET;
        expiresIn = envConfig.ACTION_FORGOT_PASSWORD_EXPIRATION;
        break;
      case ActionTokenTypeEnum.VERIFY_EMAIL:
        secret = envConfig.ACTION_VERIFY_EMAIL_SECRET;
        expiresIn = envConfig.ACTION_VERIFY_EMAIL_EXPIRATION;
        break;
      case ActionTokenTypeEnum.ACCOUNT_RESTORE:
        secret = envConfig.ACTION_ACCOUNT_RESTORE_SECRET;
        expiresIn = envConfig.ACTION_ACCOUNT_RESTORE_EXPIRATION;
        break;
      default:
        throw new ApiError(
          ERRORS.INVALID_TOKEN_TYPE.message,
          ERRORS.INVALID_TOKEN_TYPE.statusCode
        );
    }
    return jwt.sign(payload, secret, {
      expiresIn: expiresIn as ms.StringValue,
    });
  }

  public verifyToken(
    token: string,
    type: TokenTypeEnum | ActionTokenTypeEnum
  ): ITokenPayload {
    try {
      let secret: string;

      switch (type) {
        case TokenTypeEnum.ACCESS:
          secret = envConfig.JWT_ACCESS_SECRET;
          break;
        case TokenTypeEnum.REFRESH:
          secret = envConfig.JWT_REFRESH_SECRET;
          break;
        case ActionTokenTypeEnum.FORGOT_PASSWORD:
          secret = envConfig.ACTION_FORGOT_PASSWORD_SECRET;
          break;
        case ActionTokenTypeEnum.VERIFY_EMAIL:
          secret = envConfig.ACTION_VERIFY_EMAIL_SECRET;
          break;
        case ActionTokenTypeEnum.ACCOUNT_RESTORE:
          secret = envConfig.ACTION_ACCOUNT_RESTORE_SECRET;
          break;
        default:
          throw new Error(ERRORS.INVALID_TOKEN_TYPE.message);
      }

      return jwt.verify(token, secret) as ITokenPayload;
    } catch (err) {
      throw new ApiError(
        err.message.includes(ERRORS.INVALID_TOKEN_TYPE.message)
          ? err.message
          : ERRORS.INVALID_TOKEN.message,
        ERRORS.INVALID_TOKEN.statusCode
      );
    }
  }
}

export const tokenService = new TokenService();
