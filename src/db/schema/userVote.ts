import { integer, pgTable, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';
import { user } from './users/users';
import { teams } from './teams';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const userVoteTable = pgTable(
    'user_votes',
    {
        hackathonId: integer('hackathon_id')
            .references(() => hackathons.id)
            .notNull(),
        userId: integer('user_id')
            .references(() => user.id, { onDelete: 'no action' })
            .notNull(),
        vote: integer('team_id')
            .references(() => teams.id)
            .notNull(),
        createdDate: timestamp('created_date').defaultNow().notNull(),
        updatedDate: timestamp('updated_date').defaultNow().notNull(),
    },
    (table) => {
        return [
            primaryKey({
                columns: [table.hackathonId, table.userId],
            }),
        ];
    }
);

export const insertUserVoteSchema = createInsertSchema(userVoteTable).pick({
    hackathonId: true,
    userId: true,
    vote: true,
});

export const getHasUserVotedSchema = z.object({
    userId: z.number().int(),
    hackathonId: z.number().int(),
});

export const getAllUserVotesSchema = z.object({
    hackathonId: z.number().int(),
});
