export class InternalServerError extends Error {
    constructor(message: string, cause?: Error) {
        super(message, { cause: cause });
    }
}

interface UnauthorizedErrorProps {
    email?: string;
    role?: string;
}

export class UnauthorizedError extends Error {
    constructor({ email, role }: UnauthorizedErrorProps = {}) {
        super(`${email} with ${role} trying to access admin route`);
    }
}
