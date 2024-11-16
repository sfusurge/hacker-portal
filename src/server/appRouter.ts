import { createCallerFactory, publicProcedure, router } from './trpc';

import { usersRouter } from './routers/usersRouter';
import { hackathonsRouter } from './routers/hackathonsRouter';
import {sendEmailRouter} from './routers/sendEmailRouter';

export const appRouter = router({
  health_check: publicProcedure.query(() => {
    return 'app router endpoint reached!';
  }),

  users: usersRouter,
  hackathons: hackathonsRouter,
  emails: sendEmailRouter,
});

// For server side call in unit test
export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
