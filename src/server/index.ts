import { publicProcedure, router } from "./trpc";

export const usersRouter = router({
    getUsers: publicProcedure.query(async () => {
        return ["user1", "user2", "user3"];
    }),
})

export type usersRouter = typeof usersRouter;