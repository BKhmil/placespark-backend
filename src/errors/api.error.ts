export class ApiError extends Error {
  constructor(
    protected readonly _message: string,
    private readonly _statusCode: number
  ) {
    super(_message);
  }

  get statusCode(): number {
    return this._statusCode;
  }

  get message(): string {
    return this._message;
  }
}
