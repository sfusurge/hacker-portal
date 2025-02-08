import {
    events as eventsTable,
    getEventsSchema,
    insertEventSchema,
} from '@/db/schema/events';
import { publicProcedure, router } from '../trpc';
import { InternalServerError, UnAuthorizedError } from '../exceptions';
import { getUserData } from '@/app/(auth)/layout';
import { UserRoleEnum } from '@/db/schema/users';
import { databaseClient } from '@/db/client';
import { and, eq } from 'drizzle-orm';
import { checkIns } from '@/db/schema/checkIn';

export const eventsRouter = router({
    createEvent: publicProcedure
        .input(insertEventSchema)
        .mutation(async ({ input }) => {
            const user = await getUserData();

            // Only admin can create events
            if (user?.userRole !== UserRoleEnum.admin) {
                throw new UnAuthorizedError(user?.email, user?.userRole);
            }

            console.log(`Inserting ${JSON.stringify(input)}`);

            const [event] = await databaseClient
                .insert(eventsTable)
                .values({
                    hackathonId: input.hackathonId,
                    title: input.title,
                    startDate: input.startDate,
                    endDate: input.endDate,
                    location: input.location,
                    color: input.color,
                    description: input.description,
                })
                .returning();

            return event;
        }),

    getEvents: publicProcedure
        .input(getEventsSchema)
        .query(async ({ input }) => {
            const user = await getUserData();

            if (user === undefined) {
                throw new InternalServerError(
                    'Unexpected `undefined` userData'
                );
            }

            const rows = await databaseClient
                .select()
                .from(eventsTable)
                .leftJoin(
                    checkIns,
                    and(
                        eq(eventsTable.id, checkIns.eventId),
                        eq(checkIns.userId, user.id)
                    )
                )
                .where(eq(eventsTable.hackathonId, input.hackathonId));

            console.log(`Returned rows: ${JSON.stringify(rows)}`);

            const events = rows.map(
                ({ events: event, check_ins: checkIns }) => {
                    return {
                        ...event,
                        checkedIn: checkIns !== undefined,
                    };
                }
            );

            return events;
        }),
});
