type ErrorName = 'USER_DOES_NOT_EXIST' | 'PROVIDER_MISMATCH';

export class AuthenticationError extends Error {
  name: ErrorName;
  message: string;
  cause?: any;

  constructor({
    name,
    message,
    cause,
  }: {
    name: ErrorName;
    message: string;
    cause?: any;
  }) {
    super(message);
    this.name = name;
    this.message = message;
    this.cause = cause;
  }
}
