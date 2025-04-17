import {
    index,
    integer,
    pgTable,
    primaryKey,
    timestamp,
} from 'drizzle-orm/pg-core';
import { teams } from './teams';
import { user } from './users/users';
import { z } from 'zod';

export const members = pgTable(
    'memberships',
    {
        teamId: integer('team_id')
            .notNull()
            .references(() => teams.id, { onDelete: 'cascade' }),
        userId: integer('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => {
        return [
            primaryKey({
                columns: [table.teamId, table.userId],
            }),
            // to query which team a user is in
            index().on(table.userId),
        ];
    }
);

export const joinTeamSchema = z.object({
    teamDisplayId: z.string().length(6),
});
export const leaveTeamSchema = z.object({
    teamId: z.number(),
});
