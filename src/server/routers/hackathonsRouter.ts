import { publicProcedure, router } from "../trpc";
import { databaseClient } from "@/db/client";
import { insertHackathonSchema, hackathons } from "@/db/schema/hackathons";

export const hackathonsRouter = router({
    getHackathons: publicProcedure.query(async () => {
        return await databaseClient.select().from(hackathons);
    }),
    addHackathon: publicProcedure.input(insertHackathonSchema).mutation(async (opts) => {
        await databaseClient.insert(hackathons).values({
            ...opts.input,
        });
    }),
});

// Type declaration
export type hackathonsRouter = typeof hackathonsRouter;
