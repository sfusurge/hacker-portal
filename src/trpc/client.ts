import { CreateTRPCReact, createTRPCReact } from "@trpc/react-query";

import { type usersRouter } from "@/server";

export const trpc = createTRPCReact<usersRouter>({})