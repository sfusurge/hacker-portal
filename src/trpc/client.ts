'use client';
import {
    inferProcedureOutput,
    inferRouterInputs,
    inferRouterOutputs,
} from '@trpc/server';
import {
    createTRPCClient,
    createTRPCReact,
    httpBatchLink,
} from '@trpc/react-query';
import { type AppRouter } from '@/server/appRouter';
import { UsersRouter } from '@/server/routers/usersRouter';

export const trpc = createTRPCReact<AppRouter>({});

export const trpcClient = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: '/api',
        }),
    ],
});

type UsersRouterInputs = inferRouterInputs<UsersRouter>;
type UsersRouterOutputs = inferRouterOutputs<UsersRouter>;

type GetUsersOutput = inferProcedureOutput<UsersRouter['getUsers']>;

export type { UsersRouterInputs, UsersRouterOutputs, GetUsersOutput };
