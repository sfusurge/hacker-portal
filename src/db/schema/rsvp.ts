import {
    index,
    integer,
    pgTable,
    primaryKey,
    timestamp,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { events } from './events';
import { user } from './users/users';

export const rsvps = pgTable(
    'rsvps',
    {
        eventId: integer('event_id')
            .notNull()
            .references(() => events.id, { onDelete: 'cascade' }),
        userId: integer('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        rsvpTime: timestamp('rsvp_time').notNull().defaultNow(),
    },
    (table) => {
        return [
            primaryKey({
                // can query which users have rsvp-ed for a certain event
                columns: [table.eventId, table.userId],
            }),
            // query all events that a user has rsvp-ed
            index().on(table.userId),
        ];
    }
);

export const ignoredEvents = pgTable(
    'ignored_events',
    {
        eventId: integer('event_id')
            .notNull()
            .references(() => events.id, { onDelete: 'cascade' }),
        userId: integer('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
    },
    (table) => [
        primaryKey({ columns: [table.eventId, table.userId] }),
        index().on(table.userId),
    ]
);

export const insertRsvpSchema = createInsertSchema(rsvps).omit({
    rsvpTime: true,
});

export const isRsvpSchema = z.object({
    userId: z.number().int(),
    eventId: z.number().int(),
});

export const getEventRsvpCountSchema = z.object({
    eventId: z.number().int(),
});
