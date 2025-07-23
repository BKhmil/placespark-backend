import { envConfig } from "../configs/env.config";
import { ERRORS } from "../constants/errors.constant";
import { ActionTokenTypeEnum } from "../enums/action-token-type.enum";
import { EmailTypeEnum } from "../enums/email-type.enum";
import { ApiError } from "../errors/api.error";
import { ITokenPair, ITokenPayload } from "../interfaces/token.interface";
import {
  IAccountRestoreRequestDto,
  IAccountRestoreSetRequestDto,
  IChangePasswordRequestDto,
  IForgotPasswordRequestDto,
  IForgotPasswordSetRequestDto,
  ISignInRequestDto,
  ISignInResponseDto,
  ISignUpRequestDto,
  IUser,
} from "../interfaces/user.interface";
import { userPresenter } from "../presenters/user.presenter";
import { actionTokenRepository } from "../repositories/action-token.repository";
import { oldPasswordRepository } from "../repositories/old-password.repository";
import { tokenRepository } from "../repositories/token.repository";
import { userRepository } from "../repositories/user.repository";
import { emailService } from "./email.service";
import { passwordService } from "./password.service";
import { tokenService } from "./token.service";

class AuthService {
  public async signUp(dto: ISignUpRequestDto): Promise<ISignInResponseDto> {
    const password = await passwordService.hashPassword(dto.password);
    const user = await userRepository.create({ ...dto, password });

    const tokens = tokenService.generateTokens({
      userId: user._id,
      role: user.role,
      name: user.name,
    });
    await tokenRepository.create({ ...tokens, _userId: user._id });

    const token = tokenService.generateActionToken(
      { userId: user._id, role: user.role, name: user.name },
      ActionTokenTypeEnum.VERIFY_EMAIL
    );

    await actionTokenRepository.create({
      token,
      type: ActionTokenTypeEnum.VERIFY_EMAIL,
      _userId: user._id,
    });

    await emailService.sendEmail(EmailTypeEnum.WELCOME, user.email, {
      name: user.name,
      frontUrl: envConfig.APP_FRONT_URL,
      actionToken: token,
    });

    return { user: userPresenter.toResponse(user), tokens };
  }

  public async signIn(dto: ISignInRequestDto): Promise<ISignInResponseDto> {
    const user = await userRepository.getByEmail(dto.email);

    await this.isPasswordCorrectOrThrow(dto.password, user.password);

    const tokens = tokenService.generateTokens({
      userId: user._id,
      name: user.name,
      role: user.role,
    });
    await tokenRepository.create({ ...tokens, _userId: user._id });
    return { user: userPresenter.toResponse(user), tokens };
  }

  public async refresh(
    tokenPayload: ITokenPayload,
    refreshToken: string
  ): Promise<ITokenPair> {
    await tokenRepository.deleteOneByParams({ refreshToken });
    const tokens = tokenService.generateTokens({
      userId: tokenPayload.userId,
      name: tokenPayload.name,
      role: tokenPayload.role,
    });
    await tokenRepository.create({ ...tokens, _userId: tokenPayload.userId });
    return tokens;
  }

  public async logout(
    accessToken: string,
    payload: ITokenPayload
  ): Promise<void> {
    await tokenRepository.deleteSignByAccessToken(accessToken);
    const user = await userRepository.getById(payload.userId);
    await emailService.sendEmail(EmailTypeEnum.LOGOUT, user.email, {
      name: user.name,
      frontUrl: envConfig.APP_FRONT_URL,
    });
  }

  public async logoutAll(payload: ITokenPayload): Promise<void> {
    await tokenRepository.deleteAllSignsByUserId(payload.userId);
    const user = await userRepository.getById(payload.userId);
    await emailService.sendEmail(EmailTypeEnum.LOGOUT, user.email, {
      name: user.name,
      frontUrl: envConfig.APP_FRONT_URL,
    });
  }

  public async forgotPassword(dto: IForgotPasswordRequestDto): Promise<void> {
    const user = await userRepository.getByEmail(dto.email);
    if (!user) {
      throw new ApiError(
        ERRORS.INVALID_CREDENTIALS.message,
        ERRORS.INVALID_CREDENTIALS.statusCode
      );
    }

    const token = tokenService.generateActionToken(
      { userId: user._id, name: user.name, role: user.role },
      ActionTokenTypeEnum.FORGOT_PASSWORD
    );
    await actionTokenRepository.create({
      type: ActionTokenTypeEnum.FORGOT_PASSWORD,
      _userId: user._id,
      token,
    });
    await emailService.sendEmail(EmailTypeEnum.FORGOT_PASSWORD, dto.email, {
      frontUrl: envConfig.APP_FRONT_URL,
      actionToken: token,
    });
  }

  public async forgotPasswordSet(
    dto: IForgotPasswordSetRequestDto,
    tokenPayload: ITokenPayload
  ): Promise<void> {
    const user = await this.isNewPasswordUniqueOrThrow(
      dto.password,
      tokenPayload.userId
    );

    await oldPasswordRepository.create({
      password: user.password,
      _userId: user._id,
    });

    const password = await passwordService.hashPassword(dto.password);
    await userRepository.updateById(user._id, { password });

    await actionTokenRepository.deleteOneByParams({ token: dto.token });
    await tokenRepository.deleteAllByParams({ _userId: user._id });
  }

  public async verify(payload: ITokenPayload): Promise<void> {
    await userRepository.updateById(payload.userId, { isVerified: true });
    await actionTokenRepository.deleteManyByParams({
      _userId: payload.userId,
      type: ActionTokenTypeEnum.VERIFY_EMAIL,
    });
  }

  public async resendVerifyEmail(tokenPayload: ITokenPayload): Promise<void> {
    const user = await userRepository.getById(tokenPayload.userId);

    if (user.isVerified) {
      throw new ApiError(
        ERRORS.EMAIL_ALREADY_VERIFIED.message,
        ERRORS.EMAIL_ALREADY_VERIFIED.statusCode
      );
    }

    await actionTokenRepository.deleteOneByParams({
      _userId: tokenPayload.userId,
    });

    const token = tokenService.generateActionToken(
      { userId: user._id, name: user.name, role: user.role },
      ActionTokenTypeEnum.VERIFY_EMAIL
    );

    await actionTokenRepository.create({
      token,
      type: ActionTokenTypeEnum.VERIFY_EMAIL,
      _userId: user._id,
    });

    await emailService.sendEmail(
      EmailTypeEnum.VERIFY_EMAIL_ON_RESEND,
      user.email,
      {
        name: user.name,
        frontUrl: envConfig.APP_FRONT_URL,
        actionToken: token,
      }
    );
  }

  public async changePassword(
    dto: IChangePasswordRequestDto,
    tokenPayload: ITokenPayload
  ): Promise<void> {
    const user = await this.isNewPasswordUniqueOrThrow(
      dto.newPassword,
      tokenPayload.userId
    );

    await this.isPasswordCorrectOrThrow(dto.oldPassword, user.password);

    await oldPasswordRepository.create({
      password: user.password,
      _userId: user._id,
    });

    const password = await passwordService.hashPassword(dto.newPassword);
    await userRepository.updateById(user._id, { password });
    await tokenRepository.deleteAllByParams({ _userId: user._id });
  }

  public async accountRestore(dto: IAccountRestoreRequestDto): Promise<void> {
    const user = await userRepository.getByEmail(dto.email);
    if (!user) {
      throw new ApiError(
        ERRORS.INVALID_CREDENTIALS.message,
        ERRORS.INVALID_CREDENTIALS.statusCode
      );
    }

    const token = tokenService.generateActionToken(
      { userId: user._id, name: user.name, role: user.role },
      ActionTokenTypeEnum.ACCOUNT_RESTORE
    );
    await actionTokenRepository.create({
      type: ActionTokenTypeEnum.ACCOUNT_RESTORE,
      _userId: user._id,
      token,
    });
    await emailService.sendEmail(EmailTypeEnum.ACCOUNT_RESTORE, dto.email, {
      frontUrl: envConfig.APP_FRONT_URL,
      actionToken: token,
    });
  }

  public async accountRestoreSet(
    dto: IAccountRestoreSetRequestDto,
    payload: ITokenPayload
  ): Promise<void> {
    await oldPasswordRepository.deleteManyByUserId(payload.userId);

    const password = await passwordService.hashPassword(dto.password);
    await userRepository.updateById(payload.userId, {
      password,
      isDeleted: false,
      deletedAt: null,
    });

    await actionTokenRepository.deleteOneByParams({ token: dto.token });
    await tokenRepository.deleteAllByParams({ _userId: payload.userId });
  }

  private async isNewPasswordUniqueOrThrow(
    newPassword: string,
    userId: string
  ): Promise<IUser> {
    const user = await userRepository.getById(userId);

    // there's the logic
    // I have
    //
    // FORGOT CASE:
    // - NEW_PASSWORD must not be equal to CURRENT_PASSWORD stored in DB                #case1
    // - NEW_PASSWORD must not match any password from the POOL_OF_OLD_PASSWORDS        #case2
    //
    // CHANGE CASE:
    // - NEW_PASSWORD must not be equal to CURRENT_PASSWORD stored in DB                #case1
    // - NEW_PASSWORD must not match any password from the POOL_OF_OLD_PASSWORDS        #case2

    // #case3 implemented at AuthService.isPasswordCorrectOrThrow()
    // - OLD_PASSWORD (sent by user) must match CURRENT_PASSWORD stored in DB           #case3

    // case#1
    const isNewPasswordEqualsCurrent = await passwordService.comparePassword(
      newPassword,
      user.password
    );

    if (isNewPasswordEqualsCurrent) {
      throw new ApiError(
        ERRORS.PASSWORD_REUSE_FORBIDDEN.message,
        ERRORS.PASSWORD_REUSE_FORBIDDEN.statusCode
      );
    }

    const docs = await oldPasswordRepository.getMany(userId);

    // #case2
    for (const doc of docs) {
      const isSame = await passwordService.comparePassword(
        newPassword,
        doc.password
      );
      if (isSame) {
        throw new ApiError(
          ERRORS.PASSWORD_REUSE_FORBIDDEN.message,
          ERRORS.PASSWORD_REUSE_FORBIDDEN.statusCode
        );
      }
    }

    return user;
  }

  private async isPasswordCorrectOrThrow(
    passwordFromUser: string,
    passwordStoredInDB: string
  ): Promise<void> {
    const flag = await passwordService.comparePassword(
      passwordFromUser,
      passwordStoredInDB
    );

    if (!flag) {
      throw new ApiError(
        ERRORS.INVALID_CREDENTIALS.message,
        ERRORS.INVALID_CREDENTIALS.statusCode
      );
    }
  }
}

export const authService = new AuthService();
