import {
    index,
    integer,
    pgTable,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { user } from './users/users';
import { auth } from '@/auth/auth';
import { databaseClient } from '@/db/client';
import { eq, inArray } from 'drizzle-orm';
import { members } from '@/db/schema/members';

const DEFAULT_MAX_MEMBERS_COUNT = 4;

export const teams = pgTable(
    'teams',
    {
        id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
        hackathonId: integer('hackathon_id')
            .notNull()
            .references(() => hackathons.id, { onDelete: 'cascade' }),
        name: varchar('name', { length: 256 }).notNull(),
        // Link to team photo
        teamPictureUrl: text('team_picture_url'),
        maxMembersCount: integer('max_members_count')
            .notNull()
            .default(DEFAULT_MAX_MEMBERS_COUNT),
        createdBy: integer('created_by')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        displayId: varchar('display_id', { length: 6 }).notNull().unique(),
    },
    (table) => {
        // to query all the teams a hackathon has
        return [index().on(table.hackathonId), index().on(table.displayId)];
    }
);

export const createTeamSchema = createInsertSchema(teams).pick({
    hackathonId: true,
    name: true,
    teamPictureUrl: true,
    // TODO: maybe maxMembersCount
});

// Return the team that user is currently in for the provided hackathonId
export const getCurrentTeamSchema = z.object({
    hackathonId: z.number().int(),
});

export async function getTeamData(tid: number) {
    const memberIds = await getMemberIds(tid);

    if (!memberIds || memberIds.length === 0) {
        return [];
    }

    const memberEmails = await databaseClient
        .select({ email: user.email })
        .from(user)
        .where(inArray(user.id, memberIds));

    return memberEmails;
}

export async function getMemberIds(tid: number): Promise<number[]> {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        return [];
    }

    const dbMembers = await databaseClient
        .select({ userId: members.userId })
        .from(members)
        .where(eq(members.teamId, tid));

    return dbMembers.map((m) => m.userId);
}

export type UserData = Awaited<ReturnType<typeof getTeamData>>;
