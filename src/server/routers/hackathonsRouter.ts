import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import {
  insertHackathonSchema,
  hackathons,
  deleteHackathonSchema,
} from '@/db/schema/hackathons';
import { eq } from 'drizzle-orm';

export const hackathonsRouter = router({
  getHackathons: publicProcedure.query(async () => {
    return await databaseClient.select().from(hackathons);
  }),
  addHackathon: publicProcedure
    .input(insertHackathonSchema)
    .mutation(async (opts) => {
      return await databaseClient
        .insert(hackathons)
        .values({
          ...opts.input,
        })
        .returning();
    }),
  deleteHackathon: publicProcedure
    .input(deleteHackathonSchema)
    .mutation(async (opts) => {
      await databaseClient
        .delete(hackathons)
        .where(eq(hackathons.id, opts.input.id));
    }),
});

// Type declaration
export type hackathonsRouter = typeof hackathonsRouter;
