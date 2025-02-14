import {
    index,
    integer,
    pgTable,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { hackathons } from './hackathons';

export const events = pgTable(
    'events',
    {
        id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
        hackathonId: integer('hackathon_id')
            .notNull()
            .references(() => hackathons.id),
        title: varchar('title', { length: 1024 }).notNull(),
        color: varchar('color', { length: 128 }).notNull(),
        startDate: timestamp('start_date').notNull(),
        endDate: timestamp('end_date').notNull(),
        location: varchar('location', { length: 1024 }).notNull(),
        description: varchar('description', { length: 2048 }).default(''),
        longDescription: text('long_description'),
    },
    (table) => {
        return [index().on(table.hackathonId)];
    }
);

// export const insertEventSchema = createInsertSchema(events);

export const insertEventSchema = z.object({
    hackathonId: z.number().int(),
    title: z.string(),
    color: z.string(),
    startDate: z.number(),
    endDate: z.number(),
    location: z.string(),
    description: z.string().optional(),
    longDescription: z.string().optional(),
});
//
export const getEventsSchema = z.object({
    hackathonId: z.number().int(),
});

export const getEventLongDescriptionSchema = z.object({
    eventId: z.number().int(),
});

export const updateEventSchema = createUpdateSchema(events)
    .omit({
        hackathonId: true,
    })
    .extend({
        eventId: z.number().int(),
        startDate: z.number().int(),
        endDate: z.number().int(),
    });

export const deleteEventSchema = z.object({
    eventId: z.number().int(),
});
