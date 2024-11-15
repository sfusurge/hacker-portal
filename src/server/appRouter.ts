import { publicProcedure, router } from './trpc';

import { usersRouter } from './routers/usersRouter';
import { hackathonsRouter } from './routers/hackathonsRouter';

export const appRouter = router({
  health_check: publicProcedure.query(() => {
    return 'app router endpoint reached!';
  }),

  users: usersRouter,
  hackathons: hackathonsRouter,
});

export type AppRouter = typeof appRouter;
