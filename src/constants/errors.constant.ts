export const ERRORS = {
  NOT_FOUND: { message: "Not found", statusCode: 404 },
  NO_AUTHORIZATION_HEADER: {
    message: "Authorization required",
    statusCode: 401,
  },
  INVALID_AUTH_FORMAT: {
    message: "Invalid Authorization format",
    statusCode: 401,
  },
  INVALID_TOKEN: { message: "Invalid or expired token", statusCode: 401 },
  ACTION_TOKEN_REQUIRED: {
    message: "Action token is required",
    statusCode: 400,
  },
  EMAIL_ALREADY_IN_USE: { message: "Email is already in use", statusCode: 409 },
  INVALID_CREDENTIALS: { message: "Invalid credentials", statusCode: 401 },
  INVALID_ID: { message: "Invalid ID format", statusCode: 400 },
  EMPTY_BODY: { message: "Request body cannot be empty", statusCode: 400 },
  VALIDATION_ERROR: { message: "Validation failed", statusCode: 400 },
  UNKNOWN_EMAIL_TYPE: { message: "Unknown email type", statusCode: 500 },
  EMAIL_SEND_FAILED: (err: Error): { message: string; statusCode: number } => {
    return { message: "Failed to send email: " + err.message, statusCode: 500 };
  },
  INVALID_TOKEN_TYPE: { message: "Invalid token type", statusCode: 500 },
  USER_NOT_FOUND_AFTER_AUTH: {
    message: "Unexpected error: user not found after authentication",
    statusCode: 500,
  },
  PASSWORD_REUSE_FORBIDDEN: {
    message: "You cannot set the old password",
    statusCode: 400,
  },
  DEFAULT: {
    message: "Something went wrong",
    statusCode: 500,
  },
  EMAIL_ALREADY_VERIFIED: {
    message: "Email is already verified",
    statusCode: 409,
  },
  USER_NOT_VERIFIED: {
    message: "User must be verified to perform this action",
    statusCode: 403,
  },
  NO_FILE_UPLOADED: { message: "No file uploaded", statusCode: 400 },
} as const;

// todo: rework
