import { TRPCError } from '@trpc/server';

export class InternalServerError extends TRPCError {
    constructor(message: string, cause?: Error) {
        super({ message, cause, code: 'INTERNAL_SERVER_ERROR' });
    }
}

export interface UnauthorizedErrorProps {
    email?: string;
    role?: string;
}


export class UnauthorizedError extends TRPCError {

    public readonly email?: string;
    public readonly role?: string;

    constructor({ email, role }: UnauthorizedErrorProps = {}) {
        super({
            message: `${email} with ${role} trying to access admin route`,
            code: 'UNAUTHORIZED',
        });
        this.email = email;
        this.role = role;
    }
}


export type Id = string | number;
export type ResourceType = 'user' | 'team' | 'hackathon' | 'application';

export interface ResourceNotFoundErrorProps {
    id: Id;
    resourceType: ResourceType;
}

export class ResourceNotFoundError extends TRPCError {

    public readonly id: Id;
    public readonly resourceType: ResourceType;

    constructor({ id, resourceType }: ResourceNotFoundErrorProps) {

        super({
            message: `Cannot find ${resourceType} with id ${id}`,
            code: 'NOT_FOUND',
        });

        this.id = id;
        this.resourceType = resourceType;
    }
}

export class BadRequestError extends TRPCError {
    constructor(message: string, cause?: Error) {
        super({ message, cause, code: 'BAD_REQUEST' });
    }
}
