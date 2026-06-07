import { InputFormPageData } from '@/components/application_components/types';
import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import {
    insertHackathonSchema,
    hackathons,
    deleteHackathonSchema,
} from '@/db/schema/hackathons';
import { asc, eq, getTableColumns } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';

export const hackathonsRouter = router({
    getHackathons: publicProcedure.query(async () => {
        return await databaseClient.select().from(hackathons);
    }),

    getActiveHackathon: publicProcedure.query(async () => {
        const { isActive, ...restOfHackathonColumns } =
            getTableColumns(hackathons);

        const [hackathon] = await databaseClient
            .select({
                ...restOfHackathonColumns,
            })
            .from(hackathons)
            .where(eq(hackathons.isActive, true))
            .limit(1)
            .orderBy(asc(hackathons.startDate));

        return hackathon ?? null;
    }),

    getVisibleHackathonsForNav: publicProcedure.query(async () => {
        return await databaseClient
            .select()
            .from(hackathons)
            .where(eq(hackathons.isVisible, true))
            .orderBy(asc(hackathons.startDate));
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
                    applicationQuestions:
                        input.applicationQuestions as InputFormPageData[],
                    version: input.version,
                })
                .returning();

            revalidateTag('active-hackathon', 'max');
            return hackathon;
        }),

    deleteHackathon: publicProcedure
        .input(deleteHackathonSchema)
        .mutation(async (opts) => {
            await databaseClient
                .delete(hackathons)
                .where(eq(hackathons.id, opts.input.id));

            revalidateTag('active-hackathon', 'max');
        }),
});

// Type declaration
export type HackathonsRouter = typeof hackathonsRouter;
