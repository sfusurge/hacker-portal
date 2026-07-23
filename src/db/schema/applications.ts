import {
    integer,
    json,
    pgEnum,
    pgTable,
    text,
    primaryKey,
    timestamp,
    boolean,
} from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';
import { user } from './users/users';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export type StatusEnum =
    | 'N/A'
    | 'Awaiting Review'
    | 'Accepted'
    | 'Declined'
    | 'Wait List'
    | 'Withdrawn'
    | 'Accepted - Pending Payment'
    | 'Accepted - RSVP to Confirm';

export const applicationStatusEnum = pgEnum('application_status', [
    'N/A',
    'Awaiting Review',
    'Accepted',
    'Declined',
    'Wait List',
    'Withdrawn',
    'Accepted - Pending Payment',
    'Accepted - RSVP to Confirm',
]);

export const applications = pgTable(
    'applications',
    {
        hackathonId: integer('hackathon_id')
            .references(() => hackathons.id)
            .notNull(),
        userId: integer('user_id')
            .references(() => user.id, { onDelete: 'no action' })
            .notNull(),
        currentStatus: applicationStatusEnum('current_status')
            .default('Awaiting Review')
            .notNull(),
        pendingStatus: applicationStatusEnum('pending_status')
            .default('N/A')
            .notNull(),
        flagged: boolean('flagged').default(false).notNull(),
        response: json().notNull(),
        createdDate: timestamp('created_date').defaultNow().notNull(),
        lastEmailSent: text('last_email_sent').notNull().default('N/A'),
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

export const deleteApplicationSchema = z.object({
    hackathonId: z.number().int(),
});

export const queryApplicationsSchema = z.object({
    hackathonId: z.number().int(),
    maxResult: z.number().int().optional().default(200),
    nextToken: z.string().regex(/^\d+$/g).optional(),
    cursor: z.string().optional(),
});

export const APPLICATION_STATUS_ENUM = [
    'N/A',
    'Accepted',
    'Declined',
    'Awaiting Review',
    'Wait List',
    'Withdrawn',
    'Accepted - Pending Payment',
    'Accepted - RSVP to Confirm',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS_ENUM)[number];

export const ApplicationStatusSchema = z.enum(APPLICATION_STATUS_ENUM);

export const updateApplicationStatusSchema = z.object({
    hackathonId: z.number().int(),
    userId: z.number().int(),
    status: ApplicationStatusSchema.optional(),
    pendingStatus: ApplicationStatusSchema.optional(),
    flagged: z.boolean().optional(),
    response: z.record(z.string(), z.any()).optional(),
});

export const batchUpdateApplicationStatusSchema = z.object({
    hackathonId: z.number().int(),
    userIds: z.array(z.number().int()),
    status: ApplicationStatusSchema.optional(),
    pendingStatus: ApplicationStatusSchema.optional(),
    flagged: z.boolean().optional(),
});

export const updateRsvpMailSentSchema = z.object({
    hackathonId: z.number().int(),
    userId: z.number().int(),
});

export const updateLastEmailSentSchema = z.object({
    hackathonId: z.number().int(),
    userId: z.number().int(),
    emailType: z.string(),
});

export const batchUpdateLastEmailSentSchema = z.object({
    hackathonId: z.number().int(),
    userIds: z.array(z.number().int()),
    emailType: z.string(),
});
