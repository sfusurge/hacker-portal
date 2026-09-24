import {
    index,
    integer,
    pgTable,
    primaryKey,
    timestamp,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { events } from './events';
import { user } from './users/users';

export const checkIns = pgTable(
    'check_ins',
    {
        eventId: integer('event_id')
            .notNull()
            .references(() => events.id),
        userId: integer('user_id')
            .notNull()
            .references(() => user.id),
        checkInTime: timestamp('check_in_time').notNull().defaultNow(),
        pointsAwarded: integer('points_awarded').notNull(),
    },
    (table) => {
        return [
            primaryKey({
                // can query which users have checked in for a certain event
                columns: [table.eventId, table.userId],
            }),
            // query all events that a user has checked in
            index().on(table.userId),
        ];
    }
);

export const insertCheckInSchema = z.object({
    eventId: z.number().int(),
    userId: z.number().int(),
    pointsAwarded: z.number().int().optional(),
});

export const isCheckInSchema = z.object({
    userId: z.number().int(),
    eventId: z.number().int(),
});

export const getEventCheckInCountSchema = z.object({
    hackathonId: z.number().int(),
});
