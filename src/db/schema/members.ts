import {
    index,
    integer,
    pgTable,
    primaryKey,
    timestamp,
} from 'drizzle-orm/pg-core';
import { teams } from './teams';
import { users } from './users';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const members = pgTable(
    'memberships',
    {
        teamId: integer('team_id')
            .notNull()
            .references(() => teams.id, { onDelete: 'cascade' }),
        userId: integer('user_id')
            .notNull()
            .references(() => users.id),
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

export const joinTeamSchema = createInsertSchema(members).pick({
    teamId: true,
});

export const leaveTeamSchema = z.object({
    teamId: z.number(),
});
