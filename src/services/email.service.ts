import { render } from "@react-email/render";
import nodemailer, { Transporter } from "nodemailer";
import React from "react";

import { envConfig } from "../configs/env.config";
import { ERRORS } from "../constants/errors.constant";
import { EmailTypeEnum } from "../enums/email-type.enum";
import { ApiError } from "../errors/api.error";
import { AccountRestoreEmail } from "../templates/AccountRestore";
import { ForgotPasswordEmail } from "../templates/ForgotPassword";
import { LogoutEmail } from "../templates/Logout";
import { VerifyOnResendEmail } from "../templates/VerifyOnResend";
import { WelcomeEmail } from "../templates/Welcome";
import { EmailTypeToPayloadType } from "../types/email-type-to-payload.type";

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: envConfig.SMTP_EMAIL,
        pass: envConfig.SMTP_PASSWORD,
      },
    });
  }

  public async sendEmail<T extends EmailTypeEnum>(
    type: T,
    email: string,
    context: EmailTypeToPayloadType[T]
  ): Promise<void> {
    try {
      let emailHtml: string;
      switch (type) {
        case EmailTypeEnum.WELCOME:
          emailHtml = await render(
            React.createElement(WelcomeEmail, {
              context: context as EmailTypeToPayloadType[EmailTypeEnum.WELCOME],
            })
          );
          break;
        case EmailTypeEnum.FORGOT_PASSWORD:
          emailHtml = await render(
            React.createElement(ForgotPasswordEmail, {
              context:
                context as EmailTypeToPayloadType[EmailTypeEnum.FORGOT_PASSWORD],
            })
          );
          break;
        case EmailTypeEnum.LOGOUT:
          emailHtml = await render(
            React.createElement(LogoutEmail, {
              context: context as EmailTypeToPayloadType[EmailTypeEnum.LOGOUT],
            })
          );
          break;
        case EmailTypeEnum.ACCOUNT_RESTORE:
          emailHtml = await render(
            React.createElement(AccountRestoreEmail, {
              context:
                context as EmailTypeToPayloadType[EmailTypeEnum.ACCOUNT_RESTORE],
            })
          );
          break;
        case EmailTypeEnum.VERIFY_EMAIL_ON_RESEND:
          emailHtml = await render(
            React.createElement(VerifyOnResendEmail, {
              context:
                context as EmailTypeToPayloadType[EmailTypeEnum.VERIFY_EMAIL_ON_RESEND],
            })
          );
          break;
        default:
          throw new ApiError(
            ERRORS.UNKNOWN_EMAIL_TYPE.message,
            ERRORS.UNKNOWN_EMAIL_TYPE.statusCode
          );
      }

      const options = {
        from: envConfig.SMTP_EMAIL,
        to: email,
        subject: this.getEmailSubject(type),
        html: emailHtml,
      };

      await this.transporter.sendMail(options);
    } catch (err) {
      const { message, statusCode } = ERRORS.EMAIL_SEND_FAILED(err);
      throw new ApiError(message, statusCode);
    }
  }

  private getEmailSubject(type: EmailTypeEnum): string {
    const subjects = {
      [EmailTypeEnum.WELCOME]: "Welcome to our service!",
      [EmailTypeEnum.FORGOT_PASSWORD]: "Reset Your Password",
      [EmailTypeEnum.LOGOUT]: "You've Logged Out",
      [EmailTypeEnum.ACCOUNT_RESTORE]: "Restore your account",
      [EmailTypeEnum.VERIFY_EMAIL_ON_RESEND]: "Confirm your email",
    };
    return subjects[type] || "Notification";
  }
}

export const emailService = new EmailService();
