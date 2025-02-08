export class InternalServerError extends Error {
    constructor(message: string, cause?: Error) {
        super(message, { cause: cause });
    }
}

export class UnAuthorizedError extends Error {
    constructor(email?: string, role?: string) {
        super(`${email} with ${role} trying to access admin route`);
    }
}
