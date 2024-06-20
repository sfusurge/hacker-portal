import { publicProcedure, router } from "./trpc";

export const appRouter = router({
    getUsers: publicProcedure.query(async () => {
        return "To be implemented";
    }),
})

export type AppRouter = typeof appRouter;