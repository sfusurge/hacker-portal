import { publicProcedure, router } from './trpc';

export const appRouter = router({
  health_check: publicProcedure.query(() => {
    return 'app router endpoint reached!';
  }),
});

export type AppRouter = typeof appRouter;
