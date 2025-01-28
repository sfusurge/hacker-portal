'use client';
import {
    inferProcedureOutput,
    inferRouterInputs,
    inferRouterOutputs,
} from '@trpc/server';
import { CreateTRPCReact, createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@/server/appRouter';
import { UsersRouter } from '@/server/routers/usersRouter';

export const trpc = createTRPCReact<AppRouter>({});

type UsersRouterInputs = inferRouterInputs<UsersRouter>;
type UsersRouterOutputs = inferRouterOutputs<UsersRouter>;

type GetUsersOutput = inferProcedureOutput<UsersRouter['getUsers']>;

export type { UsersRouterInputs, UsersRouterOutputs, GetUsersOutput };
