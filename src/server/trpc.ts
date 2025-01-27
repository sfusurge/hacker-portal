import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const router = t.router;
// TODO create authenticated procedure and update corresponding routers.
export const publicProcedure = t.procedure;

export const createCallerFactory = t.createCallerFactory;
