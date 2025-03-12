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
import { users } from './users';

const DEFAULT_MAX_MEMBERS_COUNT = 4;

export const teams = pgTable(
    'teams',
    {
        id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
        hackathonId: integer('hackathon_id')
            .notNull()
            .references(() => hackathons.id),
        name: varchar('name', { length: 256 }).notNull(),
        // Link to team photo
        teamPictureUrl: text('team_picture_url'),
        maxMembersCount: integer('max_members_count')
            .notNull()
            .default(DEFAULT_MAX_MEMBERS_COUNT),
        createdBy: integer('created_by')
            .notNull()
            .references(() => users.id),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => {
        // to query all the teams a hackathon has
        return [index().on(table.hackathonId)];
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

// export const deleteTeamSchema = z.object({
//     id: z.number().int(),
// });
