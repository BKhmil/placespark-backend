import { EmailTypeEnum } from "../enums/email-type.enum";
import { EmailCombinedPayloadType } from "./email-combined-payload.type";
import { PickRequired } from "./pick-required.type";

export type EmailTypeToPayloadType = {
  [EmailTypeEnum.WELCOME]: PickRequired<
    EmailCombinedPayloadType,
    "frontUrl" | "name" | "actionToken"
  >;
  [EmailTypeEnum.FORGOT_PASSWORD]: PickRequired<
    EmailCombinedPayloadType,
    "frontUrl" | "actionToken"
  >;
  [EmailTypeEnum.LOGOUT]: PickRequired<
    EmailCombinedPayloadType,
    "frontUrl" | "name"
  >;
  [EmailTypeEnum.ACCOUNT_RESTORE]: PickRequired<
    EmailCombinedPayloadType,
    "frontUrl" | "actionToken"
  >;
  [EmailTypeEnum.VERIFY_EMAIL_ON_RESEND]: PickRequired<
    EmailCombinedPayloadType,
    "frontUrl" | "name" | "actionToken"
  >;
};
