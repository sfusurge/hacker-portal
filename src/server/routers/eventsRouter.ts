import {
    deleteEventSchema,
    events as eventsTable,
    EventType,
    getEventCheckInCountSchema,
    getEventLongDescriptionSchema,
    getEventsSchema,
    insertEventSchema,
    updateEventSchema,
} from '@/db/schema/events';
import { publicProcedure, router } from '../trpc';
import { InternalServerError, UnauthorizedError } from '../exceptions';
import { TRPCError } from '@trpc/server';

import { databaseClient } from '@/db/client';
import { and, asc, count, eq, getTableColumns } from 'drizzle-orm';
import { checkIns } from '@/db/schema/checkIn';
import { z } from 'zod';
import { getUserData } from '@/server/routers/usersRouter';
import { hasAdminAccess } from '@/lib/auth/roles';

export interface CalendarEvent {
    id: number;
    checkedIn: boolean;
    hasLongDescription: boolean;
    startDate: Date;
    endDate: Date;
    hackathonId: number;
    title: string;
    color: string;
    location: string;
    description?: string | undefined;
    checkInTime?: string | undefined;
    hasCheckIn: boolean;
    eventType: EventType;
}

export const eventsRouter = router({
    createEvent: publicProcedure
        .input(insertEventSchema)
        .mutation(async ({ input }) => {
            const user = await getUserData();

            // Only admin can create events
            if (!hasAdminAccess(user?.userRole)) {
                throw new UnauthorizedError({
                    email: user?.email,
                    role: user?.userRole,
                });
            }
            console.log(`Inserting ${JSON.stringify(input)}`);

            const [event] = await databaseClient
                .insert(eventsTable)
                .values({
                    hackathonId: input.hackathonId,
                    title: input.title,
                    startDate: new Date(input.startDate),
                    endDate: new Date(input.endDate),
                    location: input.location,
                    color: input.color,
                    description: input.description,
                    longDescription: input.longDescription,
                    eventType: input.eventType as EventType,
                    hasCheckIn: input.hasCheckIn,
                })
                .returning();

            return {
                ...event,
                startDate: event.startDate?.toUTCString(),
                endDate: event.endDate?.toUTCString(),
            };
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

            const { longDescription, ...rest } = getTableColumns(eventsTable);

            const rows = await databaseClient
                .select({
                    checkIn: {
                        userId: checkIns.userId,
                        checkInTime: checkIns.checkInTime,
                    },
                    event: eventsTable,
                })
                .from(eventsTable)
                .leftJoin(
                    checkIns,
                    and(
                        eq(eventsTable.id, checkIns.eventId),
                        eq(checkIns.userId, user.id)
                    )
                )
                .where(eq(eventsTable.hackathonId, input.hackathonId))
                // events with earlier startDate comes first
                // if 2 events have same startDate, then the one with earlier
                // endDate comes first
                .orderBy(asc(eventsTable.startDate), asc(eventsTable.endDate));

            const events = rows.map(({ checkIn, event: _event }) => {
                const { longDescription, ...event } = { ..._event };
                return {
                    ...event,
                    checkedIn: checkIn != null,
                    description: event.description ?? undefined,
                    hasLongDescription:
                        longDescription !== undefined &&
                        longDescription !== null &&
                        longDescription.length > 0,
                    checkInTime: checkIn?.checkInTime ?? undefined,
                };
            });

            return events as CalendarEvent[];
        }),

    getHackathonCheckInEvents: publicProcedure
        .input(z.object({ hackathonId: z.number() }))
        .query(async ({ input }) => {
            const { longDescription, ...columns } =
                getTableColumns(eventsTable);

            const events = await databaseClient
                .select(columns)
                .from(eventsTable)
                .where(
                    and(
                        eq(eventsTable.hackathonId, input.hackathonId),
                        eq(eventsTable.hasCheckIn, true)
                    )
                )
                .orderBy(asc(eventsTable.startDate));

            return events.map((event) => {
                return {
                    ...event,
                    startDate: event.startDate.toISOString(),
                    endDate: event.endDate.toISOString(),
                };
            });
        }),

    getEventLongDescription: publicProcedure
        .input(getEventLongDescriptionSchema)
        .query(async ({ input }) => {
            const [event] = await databaseClient
                .select({
                    id: eventsTable.id,
                    longDescription: eventsTable.longDescription,
                })
                .from(eventsTable)
                .where(eq(eventsTable.id, input.eventId))
                .limit(1);

            return event ?? {};
        }),

    getEventCheckInCount: publicProcedure
        .input(getEventCheckInCountSchema)
        .query(async ({ input }) => {
            const [result] = await databaseClient
                .select({ checkInCount: count(checkIns.userId) })
                .from(checkIns)
                .where(eq(checkIns.eventId, input.eventId));

            return { checkInCount: result?.checkInCount ?? 0 };
        }),

    updateEvent: publicProcedure
        .input(updateEventSchema)
        .mutation(async ({ input }) => {
            const [event] = await databaseClient
                .update(eventsTable)
                .set({
                    title: input.title,
                    color: input.color,
                    startDate: new Date(input.startDate),
                    endDate: new Date(input.endDate),
                    location: input.location,
                    description: input.description,
                    longDescription: input.longDescription,
                    eventType: input.eventType as EventType,
                    hasCheckIn: input.hasCheckIn,
                })
                .where(eq(eventsTable.id, input.eventId))
                .returning();

            return event;
        }),

    deleteEvent: publicProcedure
        .input(deleteEventSchema)
        .mutation(async ({ input }) => {
            const [result] = await databaseClient
                .select({ checkInCount: count(checkIns.userId) })
                .from(checkIns)
                .where(eq(checkIns.eventId, input.eventId));

            if ((result?.checkInCount ?? 0) > 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Cannot delete an event with existing check-ins.',
                });
            }

            return await databaseClient
                .delete(eventsTable)
                .where(eq(eventsTable.id, input.eventId));
        }),
});
