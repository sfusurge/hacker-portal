import { publicProcedure, router } from "./trpc";

import { usersRouter } from "./routers/usersRouter";

export const appRouter = router({
  health_check: publicProcedure.query(() => {
    return "app router endpoint reached!";
  }),

  users: usersRouter,
});

export type AppRouter = typeof appRouter;
