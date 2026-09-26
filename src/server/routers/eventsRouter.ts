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
import {
    adminProcedure,
    protectedProcedure,
    publicProcedure,
    router,
} from '../trpc';
import { TRPCError } from '@trpc/server';

import { databaseClient } from '@/db/client';
import { and, asc, count, eq, getTableColumns } from 'drizzle-orm';
import { checkIns } from '@/db/schema/checkIn';
import {
    getEventRsvpCountSchema,
    ignoredEvents,
    rsvps,
} from '@/db/schema/rsvp';
import { z } from 'zod';

export interface CalendarEvent {
    id: number;
    checkedIn: boolean;
    rsvped: boolean;
    ignored: boolean;
    hasLongDescription: boolean;
    startDate: Date;
    endDate: Date;
    hackathonId: number;
    title: string;
    color: string;
    location: string;
    imageUrl?: string;
    description?: string | undefined;
    checkInTime?: string | undefined;
    hasCheckIn: boolean;
    eventType: EventType;
}

const rsvpEventSchema = z.object({
    eventId: z.number().int(),
});

async function checkEventExists(eventId: number) {
    const [event] = await databaseClient
        .select({ id: eventsTable.id })
        .from(eventsTable)
        .where(eq(eventsTable.id, eventId))
        .limit(1);

    if (!event) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Cannot find event with id ${eventId}`,
        });
    }
}

export const eventsRouter = router({
    createEvent: adminProcedure
        .input(insertEventSchema)
        .mutation(async ({ input }) => {
            console.log(`Inserting ${JSON.stringify(input)}`);
            const eventType = (input.eventType ?? EventType.EVENT) as EventType;

            const [event] = await databaseClient
                .insert(eventsTable)
                .values({
                    hackathonId: input.hackathonId,
                    title: input.title,
                    startDate: new Date(input.startDate),
                    endDate: new Date(input.endDate),
                    location: input.location,
                    imageUrl: input.imageUrl || null,
                    color: input.color,
                    description: input.description,
                    longDescription: input.longDescription,
                    eventType,
                    hasCheckIn: input.hasCheckIn,
                })
                .returning();

            return {
                ...event,
                startDate: event.startDate?.toUTCString(),
                endDate: event.endDate?.toUTCString(),
            };
        }),

    getEvents: protectedProcedure
        .input(getEventsSchema)
        .query(async ({ input, ctx }) => {
            const rows = await databaseClient
                .select({
                    checkIn: {
                        userId: checkIns.userId,
                        checkInTime: checkIns.checkInTime,
                    },
                    rsvp: {
                        userId: rsvps.userId,
                    },
                    ignored: {
                        userId: ignoredEvents.userId,
                    },
                    event: eventsTable,
                })
                .from(eventsTable)
                .leftJoin(
                    checkIns,
                    and(
                        eq(eventsTable.id, checkIns.eventId),
                        eq(checkIns.userId, ctx.user.id)
                    )
                )
                .leftJoin(
                    rsvps,
                    and(
                        eq(rsvps.eventId, eventsTable.id),
                        eq(rsvps.userId, ctx.user.id)
                    )
                )
                .leftJoin(
                    ignoredEvents,
                    and(
                        eq(ignoredEvents.eventId, eventsTable.id),
                        eq(ignoredEvents.userId, ctx.user.id)
                    )
                )
                .where(eq(eventsTable.hackathonId, input.hackathonId))
                .orderBy(
                    asc(eventsTable.startDate),
                    asc(eventsTable.endDate),
                    asc(eventsTable.id)
                );

            const events = rows.map(
                ({ checkIn, rsvp, ignored, event: _event }) => {
                    const { longDescription, ...event } = { ..._event };
                    return {
                        ...event,
                        imageUrl: event.imageUrl ?? undefined,
                        checkedIn: checkIn != null,
                        rsvped: rsvp != null,
                        ignored: ignored != null,
                        description: event.description ?? undefined,
                        hasLongDescription:
                            longDescription !== undefined &&
                            longDescription !== null &&
                            longDescription.length > 0,
                        checkInTime: checkIn?.checkInTime ?? undefined,
                    };
                }
            );

            return events as CalendarEvent[];
        }),

    rsvpEvent: protectedProcedure
        .input(rsvpEventSchema)
        .mutation(async ({ input, ctx }) => {
            await checkEventExists(input.eventId);

            await databaseClient
                .insert(rsvps)
                .values({
                    eventId: input.eventId,
                    userId: ctx.user.id,
                })
                .onConflictDoNothing({
                    target: [rsvps.eventId, rsvps.userId],
                });
            await databaseClient
                .delete(ignoredEvents)
                .where(
                    and(
                        eq(ignoredEvents.eventId, input.eventId),
                        eq(ignoredEvents.userId, ctx.user.id)
                    )
                );

            return true;
        }),

    ignoreEvent: protectedProcedure
        .input(rsvpEventSchema.extend({ ignored: z.boolean() }))
        .mutation(async ({ input, ctx }) => {
            const { eventId, ignored } = input;
            await checkEventExists(eventId);

            if (!ignored) {
                await databaseClient
                    .delete(ignoredEvents)
                    .where(
                        and(
                            eq(ignoredEvents.eventId, eventId),
                            eq(ignoredEvents.userId, ctx.user.id)
                        )
                    );
                return true;
            }

            await databaseClient
                .insert(ignoredEvents)
                .values({ eventId, userId: ctx.user.id })
                .onConflictDoNothing();
            await databaseClient
                .delete(rsvps)
                .where(
                    and(
                        eq(rsvps.eventId, eventId),
                        eq(rsvps.userId, ctx.user.id)
                    )
                );

            return true;
        }),

    unrsvpEvent: protectedProcedure
        .input(rsvpEventSchema)
        .mutation(async ({ input, ctx }) => {
            await checkEventExists(input.eventId);

            await databaseClient
                .delete(rsvps)
                .where(
                    and(
                        eq(rsvps.eventId, input.eventId),
                        eq(rsvps.userId, ctx.user.id)
                    )
                );

            return true;
        }),

    getHackathonCheckInEvents: adminProcedure
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

    getEventCheckInCount: adminProcedure
        .input(getEventCheckInCountSchema)
        .query(async ({ input }) => {
            const [result] = await databaseClient
                .select({ checkInCount: count(checkIns.userId) })
                .from(checkIns)
                .where(eq(checkIns.eventId, input.eventId));

            return { checkInCount: result?.checkInCount ?? 0 };
        }),

    getEventRsvpCount: adminProcedure
        .input(getEventRsvpCountSchema)
        .query(async ({ input }) => {
            const [result] = await databaseClient
                .select({ rsvpCount: count(rsvps.userId) })
                .from(rsvps)
                .where(eq(rsvps.eventId, input.eventId));

            return { rsvpCount: result?.rsvpCount ?? 0 };
        }),

    updateEvent: adminProcedure
        .input(updateEventSchema)
        .mutation(async ({ input }) => {
            const eventType = (input.eventType ?? EventType.EVENT) as EventType;

            const [event] = await databaseClient
                .update(eventsTable)
                .set({
                    title: input.title,
                    color: input.color,
                    startDate: new Date(input.startDate),
                    endDate: new Date(input.endDate),
                    location: input.location,
                    imageUrl: input.imageUrl || null,
                    description: input.description,
                    longDescription: input.longDescription,
                    eventType,
                    hasCheckIn: input.hasCheckIn,
                })
                .where(eq(eventsTable.id, input.eventId))
                .returning();

            return event;
        }),

    deleteEvent: adminProcedure
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
