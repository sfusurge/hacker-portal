import { initTRPC, TRPCError } from '@trpc/server';
import { hasAdminAccess, isOwner } from '@/lib/auth/roles';
import { getUserData } from '@/server/auth/sessionUser';
import { UserRoleEnum } from '@/db/schema/users/users';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceUser = t.middleware(async ({ next }) => {
    const user = await getUserData();
    if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
        ctx: { user },
    });
});

const enforceAdmin = t.middleware(async ({ next }) => {
    const user = await getUserData();
    if (!user || !hasAdminAccess(user.userRole)) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
        ctx: { user },
    });
});

const enforceAdminOrSponsor = t.middleware(async ({ next }) => {
    const user = await getUserData();
    if (
        !user ||
        (!hasAdminAccess(user.userRole) && user.userRole !== 'sponsor')
    ) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
        ctx: { user },
    });
});

const enforceOwner = t.middleware(async ({ next }) => {
    const user = await getUserData();
    if (!user || !isOwner(user.userRole)) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
        ctx: { user },
    });
});

export const protectedProcedure = t.procedure.use(enforceUser);

export const adminProcedure = t.procedure.use(enforceAdmin);

export const adminOrSponsorProcedure = t.procedure.use(enforceAdminOrSponsor);

export const ownerProcedure = t.procedure.use(enforceOwner);

const enforceJudgeOrAdmin = t.middleware(async ({ next }) => {
    const user = await getUserData();
    if (
        !user ||
        (!hasAdminAccess(user.userRole) && user.userRole !== UserRoleEnum.judge)
    ) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
        ctx: { user },
    });
});

export const judgeOrAdminProcedure = t.procedure.use(enforceJudgeOrAdmin);

export const createCallerFactory = t.createCallerFactory;
