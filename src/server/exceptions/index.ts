export class InternalServerError extends Error {
    constructor(message: string, cause?: Error) {
        super(message, { cause: cause });
    }
}

export interface UnauthorizedErrorProps {
    email?: string;
    role?: string;
}

export class UnauthorizedError extends Error {
    public readonly email?: string;
    public readonly role?: string;

    constructor({ email, role }: UnauthorizedErrorProps = {}) {
        super(`${email} with ${role} trying to access admin route`);
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

export class ResourceNotFoundError extends Error {
    public readonly id: Id;
    public readonly resourceType: ResourceType;

    constructor({ id, resourceType }: ResourceNotFoundErrorProps) {
        super(`Cannot find ${resourceType} with id ${id}`);
        this.id = id;
        this.resourceType = resourceType;
    }
}
