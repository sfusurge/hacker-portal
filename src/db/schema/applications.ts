import {
    integer,
    json,
    pgEnum,
    pgTable,
    primaryKey,
    timestamp,
} from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';
import { users } from './users';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export type StatusEnum =
    | 'N/A'
    | 'Awaiting Review'
    | 'Accepted'
    | 'Declined'
    | 'Wait List';

export const applicationStatusEnum = pgEnum('application_status', [
    'N/A',
    'Awaiting Review',
    'Accepted',
    'Declined',
    'Wait List',
]);

export const applications = pgTable(
    'applications',
    {
        hackathonId: integer('hackathon_id')
            .references(() => hackathons.id)
            .notNull(),
        userId: integer('user_id')
            .references(() => users.id)
            .notNull(),
        currentStatus: applicationStatusEnum()
            .default('Awaiting Review')
            .notNull(),
        pendingStatus: applicationStatusEnum().default('N/A').notNull(),
        response: json().notNull(),
        createdDate: timestamp()
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => {
        return [
            // https://github.com/drizzle-team/drizzle-orm/issues/3596
            primaryKey({
                columns: [table.hackathonId, table.userId],
            }),
        ];
    }
);

export const insertApplicationSchema = createInsertSchema(applications).pick({
    hackathonId: true,
    response: true,
});

export const queryApplicationsSchema = z.object({
    hackathonId: z.number().int(),
    userId: z.number().int().optional(),
    maxResult: z.number().int().optional().default(100),
    nextToken: z.string().regex(/^\d+$/g).optional(),
});

export const updateApplicationStatusSchema = z.object({
    hackathonId: z.number().int(),
    userId: z.number().int(),
    status: z
        .enum(['Accepted', 'Declined', 'Awaiting Review', 'Wait List'])
        .optional(),
    pendingStatus: z
        .enum(['Accepted', 'Declined', 'Awaiting Review', 'Wait List'])
        .optional(),
});
