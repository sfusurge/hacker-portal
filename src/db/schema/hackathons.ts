import { ApplicationPage } from '@/app/(auth)/application/application_components/types';
import {
    boolean,
    integer,
    jsonb,
    pgTable,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';

import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Journey hack submission deadline, February 13th, 2025 at 23:59:59
const JOURNEY_HACK_2025_DEADLINE = new Date(1_739_519_999 * 1_000);

const hackathons = pgTable('hackathons', {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    startDate: varchar('start_date', { length: 255 }).notNull(),
    endDate: varchar('end_date', { length: 255 }).notNull(),
    submissionDeadline: timestamp('submission_deadline')
        .notNull()
        .default(JOURNEY_HACK_2025_DEADLINE),
    questions: jsonb('questions')
        .$type<ApplicationPage[]>()
        .notNull()
        .default([]),
    version: integer('version').notNull().default(1),
    isActive: boolean('is_active').notNull().default(false),
});

const insertHackathonSchema = createInsertSchema(hackathons, {
    startDate: (startDate) => startDate.date(),
    endDate: (endDate) => endDate.date(),
});

const deleteHackathonSchema = z
    .object({
        id: z.number().gte(1),
    })
    .required();

const selectHackathonSchema = createSelectSchema(hackathons);

export {
    deleteHackathonSchema,
    hackathons,
    insertHackathonSchema,
    selectHackathonSchema,
};
