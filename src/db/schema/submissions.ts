import { integer, json, pgEnum, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { teams } from './teams';

export const submissionStatusEnum = pgEnum('submission_status', [
    'Awaiting Review',
    'Reviewed',
]);
export type SubmissionStatusEnumType =
    (typeof submissionStatusEnum)['enumValues'][number];

export const submissions = pgTable('submissions', {
    teamId: integer('team_id')
        .references(() => teams.id, { onDelete: 'no action' })
        .primaryKey()
        .notNull(),
    currentStatus: submissionStatusEnum('current_status')
        .default('Awaiting Review')
        .notNull(),
    response: json().notNull(),
    createdDate: timestamp('created_date').defaultNow().notNull(),
});

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
    teamId: true,
    response: true,
});

export const getSubmissionQuestionsSchema = z.object({
    hackathonId: z.number().int(),
});

export const getHasSubmissionSchema = z.object({
    userId: z.number().int(),
});
