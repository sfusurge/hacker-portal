import { testingRouter } from './testingRoute';
import { publicProcedure, router } from './trpc';

export const appRouter = router({
  health_check: publicProcedure.query(() => {
    return 'app router endpoint reached!';
  }),

  demo: testingRouter,
});

export type AppRouter = typeof appRouter;
