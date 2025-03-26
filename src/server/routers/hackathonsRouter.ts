import { ApplicationPage } from '@/app/(auth)/application/application_components/types';
import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import {
    insertHackathonSchema,
    hackathons,
    deleteHackathonSchema,
} from '@/db/schema/hackathons';
import { asc, eq, getTableColumns } from 'drizzle-orm';

export const hackathonsRouter = router({
    getHackathons: publicProcedure.query(async () => {
        return await databaseClient.select().from(hackathons);
    }),

    getActiveHackathon: publicProcedure.query(async () => {
        const { isActive, ...rest } = getTableColumns(hackathons);

        const [hackathon] = await databaseClient
            .select(rest)
            .from(hackathons)
            .where(eq(hackathons.isActive, true))
            .limit(1)
            .orderBy(asc(hackathons.startDate));

        return hackathon ?? null;
    }),

    addHackathon: publicProcedure
        .input(insertHackathonSchema)
        .mutation(async ({ input }) => {
            const [hackathon] = await databaseClient
                .insert(hackathons)
                .values({
                    name: input.name,
                    startDate: input.startDate,
                    endDate: input.endDate,
                    isActive: input.isActive,
                    questions: input.questions as ApplicationPage[],
                })
                .returning();

            return hackathon;
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
export type HackathonsRouter = typeof hackathonsRouter;
