import { getUserData } from '@/app/(auth)/layout';
import { databaseClient } from '@/db/client';
import { checkIns, insertCheckInSchema } from '@/db/schema/checkIn';
import { UserRoleEnum } from '@/db/schema/users';
import { UnauthorizedError } from '../exceptions';
import { publicProcedure, router } from '../trpc';

export const checkInRouter = router({
    checkIn: publicProcedure
        .input(insertCheckInSchema)
        .mutation(async ({ input }) => {
            const user = await getUserData();

            // Only admin can check people in
            if (user?.userRole !== UserRoleEnum.admin) {
                throw new UnauthorizedError({
                    email: user?.email,
                    role: user?.userRole,
                });
            }

            await databaseClient
                .insert(checkIns)
                .values({
                    eventId: input.eventId,
                    userId: input.userId,
                })
                .onConflictDoNothing({
                    target: [checkIns.userId, checkIns.eventId],
                });

            return true;
        }),
});
