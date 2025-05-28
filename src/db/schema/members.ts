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
import { and, eq } from 'drizzle-orm';
import { databaseClient } from '../client';

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

export async function checkUserInTeam(
    userId: number,
    teamId: number
): Promise<void> {
    const entries = await databaseClient
        .select({ userId: members.userId })
        .from(members)
        .where(and(eq(members.userId, userId), eq(members.teamId, teamId)));

    if (entries.length === 0) {
        throw new Error(`User ${userId} is not in team ${teamId}`);
    }
}
