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
        const { hackathon_id, start_date, end_date, ...updateValues } = opts.input;

        const formatUpdateValues = {
            ...updateValues,
            start_date: start_date.toISOString(),
            end_date: end_date.toISOString(),
        }
        
        await databaseClient.update(hackathons).set(formatUpdateValues).where(eq(hackathons.hackathon_id, hackathon_id));
    }),    
    deleteHackathon: publicProcedure.input(deleteHackathonSchema).mutation(async (opts) => {
        await databaseClient.delete(hackathons).where(eq(hackathons.hackathon_id, opts.input.hackathon_id));
    }),
});

// Type declaration
export type hackathonsRouter = typeof hackathonsRouter;
