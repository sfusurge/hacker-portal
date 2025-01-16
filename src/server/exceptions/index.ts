export class InternalServerError extends Error {
  constructor(message: string, cause?: Error) {
    super(message, { cause: cause });
  }
}
