import {
    index,
    integer,
    pgTable,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { hackathons } from './hackathons';
import { judgingKindEnum } from './judgingKind';
import { teams } from './teams';

export const devpostProjects = pgTable(
    'devpost_projects',
    {
        id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
        hackathonId: integer('hackathon_id')
            .notNull()
            .references(() => hackathons.id, { onDelete: 'cascade' }),
        teamId: integer('team_id').references(() => teams.id, {
            onDelete: 'set null',
        }),
        title: varchar('title', { length: 512 }).notNull(),
        submissionUrl: text('submission_url'),
        /** Devpost Opt-In Prizes / track labels. */
        tracks: text('tracks').array().notNull().default([]),
        /**
         * Judging pool. Default software; set hardware when the project is a
         * hardware submission (import heuristic or admin override).
         */
        kind: judgingKindEnum('kind').notNull().default('software'),
        createdAt: timestamp('created_at', {
            mode: 'date',
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp('updated_at', {
            mode: 'date',
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index('devpost_projects_hackathon_id_idx').on(table.hackathonId),
        index('devpost_projects_team_id_idx').on(table.teamId),
        index('devpost_projects_hackathon_kind_idx').on(
            table.hackathonId,
            table.kind
        ),
    ]
);

export const insertDevpostProjectSchema = z.object({
    hackathonId: z.number().int(),
    teamId: z.number().int().optional().nullable(),
    title: z.string().min(1).max(512),
    submissionUrl: z.string().url().optional().nullable(),
    tracks: z.array(z.string()).optional(),
    kind: z.enum(['software', 'hardware']).optional(),
});

export type DevpostProject = typeof devpostProjects.$inferSelect;
