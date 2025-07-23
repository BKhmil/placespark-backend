export const regexConstant = {
  EMAIL: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%_*#?&])[A-Za-z\d@$_!%*#?&]{8,}$/,
  PHONE_UA_REGEX: /^\+380\d{9}$/,
  TG_REGEX: /^(?:https?:\/\/)?(?:t\.me\/)?(?:@)?([a-zA-Z0-9_]+)$/,
} as const;
