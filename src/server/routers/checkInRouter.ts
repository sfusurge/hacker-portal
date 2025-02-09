import { checkIns, insertCheckInSchema } from '@/db/schema/checkIn';
import { publicProcedure, router } from '../trpc';
import { getUserData } from '@/app/(auth)/layout';
import { databaseClient } from '@/db/client';
import { InternalServerError } from '../exceptions';

export const checkInRouter = router({
    checkIn: publicProcedure
        .input(insertCheckInSchema)
        .mutation(async ({ input }) => {
            const user = await getUserData();

            if (user === undefined) {
                throw new InternalServerError(
                    'Unexpected `undefined` userData'
                );
            }

            await databaseClient
                .insert(checkIns)
                .values({
                    userId: user.id,
                    eventId: input.eventId,
                })
                .onConflictDoNothing({
                    target: [checkIns.userId, checkIns.eventId],
                });

            return true;
        }),
});
