import {
    integer,
    json,
    pgTable,
    primaryKey,
    timestamp,
    pgEnum,
} from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';
import { user } from './users/users';
import { teams } from './teams';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const judgingStatusEnum = pgEnum('judging_status', [
    'unjudged',
    'judged',
]);
export type JudgingStatusEnumType =
    (typeof judgingStatusEnum)['enumValues'][number];

export const judgingAssignments = pgTable(
    'judging_assignments',
    {
        hackathonId: integer('hackathon_id')
            .references(() => hackathons.id)
            .notNull(),
        teamId: integer('team_id')
            .references(() => teams.id)
            .notNull(),
        userId: integer('user_id')
            .references(() => user.id, { onDelete: 'no action' })
            .notNull(),
        status: judgingStatusEnum('status').default('unjudged').notNull(),
        response: json('response'),
        createdDate: timestamp('created_date').defaultNow().notNull(),
        updatedDate: timestamp('updated_date').defaultNow().notNull(),
    },
    (table) => {
        return [
            primaryKey({
                columns: [table.hackathonId, table.teamId, table.userId],
            }),
        ];
    }
);

export const insertJudgingAssignmentSchema = createInsertSchema(
    judgingAssignments
).pick({
    hackathonId: true,
    teamId: true,
    userId: true,
    status: true,
});

export const updateJudgingAssignmentSchema = createInsertSchema(
    judgingAssignments
).pick({
    hackathonId: true,
    teamId: true,
    userId: true,
    status: true,
    response: true,
});

export const getJudgingAssignmentsSchema = z.object({
    hackathonId: z.number().int(),
});

export const updateJudgingStatusSchema = z.object({
    hackathonId: z.number().int(),
    teamId: z.number().int(),
    userId: z.number().int(),
    status: z.enum(['unjudged', 'judged']),
});

export const getJudgingProjectsSchema = z.object({
    hackathonId: z.number().int(),
});

export const getJudgingScoreSchema = z.object({
    hackathonId: z.number().int(),
    teamId: z.number(),
    judgeId: z.number().int().optional(),
});

export const updateJudgingProjectStatusSchema = z.object({
    hackathonId: z.number().int(),
    teamId: z.number().int(),
    userId: z.number().int(),
    status: z.enum(['unjudged', 'judged']),
});
