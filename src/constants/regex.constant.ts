export const regexConstant = {
  EMAIL: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%_*#?&])[A-Za-z\d@$_!%*#?&]{8,}$/,
  PHONE_UA_REGEX: /^\+380\d{9}$/,
  TG_REGEX: /^(?:https?:\/\/)?(?:t\.me\/)?(?:@)?([a-zA-Z0-9_]+)$/,
  REGEX_TIME_HH_MM: /^([01]\d|2[0-3]):([0-5]\d)$/,
  CLOUDINARY_PUBLIC_ID: /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/,
} as const;
