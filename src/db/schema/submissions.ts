import {
    integer,
    json,
    pgEnum,
    pgTable,
    primaryKey,
    timestamp,
} from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';
import { user } from './users/users';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { teams } from '@/db/schema/teams';

export const submissionStatusEnum = pgEnum('submission_status', [
    'Awaiting Review',
    'Reviewed',
]);
export type SubmissionStatusEnumType =
    (typeof submissionStatusEnum)['enumValues'][number];

export const submissions = pgTable(
    'submissions',
    {
        hackathonId: integer('hackathon_id')
            .references(() => hackathons.id)
            .notNull(),
        teamId: integer('team_id')
            .references(() => teams.id, { onDelete: 'no action' })
            .notNull(),
        currentStatus: submissionStatusEnum('current_status')
            .default('Awaiting Review')
            .notNull(),
        response: json().notNull(),
        createdDate: timestamp('created_date').defaultNow().notNull(),
    },
    (table) => {
        return [
            // https://github.com/drizzle-team/drizzle-orm/issues/3596
            primaryKey({
                columns: [table.hackathonId, table.teamId],
            }),
        ];
    }
);

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
    teamId: true,
    hackathonId: true,
    response: true,
});

export const getSubmissionQuestionsSchema = z.object({
    hackathonId: z.number().int(),
});

export const getHasSubmissionSchema = z.object({
    userId: z.number().int(),
    hackathonId: z.number().int(),
});
