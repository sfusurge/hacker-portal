import {
    integer,
    json,
    pgTable,
    primaryKey,
    timestamp,
} from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';
import { user } from './users/users';
import { teams } from './teams';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const judgingScores = pgTable(
    'judging_scores',
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
        response: json().notNull(),
        createdDate: timestamp('created_date').defaultNow().notNull(),
    },
    (table) => {
        return [
            primaryKey({
                columns: [table.hackathonId, table.teamId, table.userId],
            }),
        ];
    }
);

export const insertJudgingScoreSchema = createInsertSchema(judgingScores).pick({
    hackathonId: true,
    teamId: true,
    userId: true,
    response: true,
});

export const getJudgingProjectsSchema = z.object({
    hackathonId: z.number().int(),
});

export const getJudgingScoreSchema = z.object({
    hackathonId: z.number().int(),
    projectId: z.number(),
    judgeId: z.number().int().optional(),
});
