import { publicProcedure, router } from "../trpc";
import { databaseClient } from "@/db/client";
import { insertHackathonSchema, deleteHackathonSchema, updateHackathonSchema, hackathons } from "@/db/schema/hackathons";
import { eq } from "drizzle-orm";

export const hackathonsRouter = router({
    getHackathons: publicProcedure.query(async () => {
        return await databaseClient.select().from(hackathons);
    }),
    addHackathon: publicProcedure.input(insertHackathonSchema).mutation(async (opts) => {
        await databaseClient.insert(hackathons).values({
            ...opts.input,
        });
    }),
    updateHackathon: publicProcedure.input(updateHackathonSchema).mutation(async (opts) => {
        const updateValues = opts.input;
        if (!updateValues.id) {
            throw new Error('ID is required to update a hackathon');
        }
        await databaseClient.update(hackathons).set(updateValues).where(eq(hackathons.id, updateValues.id));
    }),    
    deleteHackathon: publicProcedure.input(deleteHackathonSchema).mutation(async (opts) => {
        await databaseClient.delete(hackathons).where(eq(hackathons.id, opts.input.id));
    }),
});

// Type declaration
export type hackathonsRouter = typeof hackathonsRouter;
