import {
    index,
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    timestamp,
    uniqueIndex,
    varchar,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { hackathons } from './hackathons';
import { judgingKindEnum } from './judgingKind';
import { teams } from './teams';

export const judgingWaveStatusEnum = pgEnum('judging_wave_status', [
    'scheduled',
    'active',
    'done',
]);

export type JudgingWaveStatus =
    (typeof judgingWaveStatusEnum)['enumValues'][number];

export const judgingWaves = pgTable(
    'judging_waves',
    {
        id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
        hackathonId: integer('hackathon_id')
            .notNull()
            .references(() => hackathons.id, { onDelete: 'cascade' }),
        label: varchar('label', { length: 255 }).notNull(),
        /** Keep software / hardware rooms in separate wave pools. */
        kind: judgingKindEnum('kind').notNull().default('software'),
        startsAt: timestamp('starts_at', {
            mode: 'date',
            withTimezone: true,
        }),
        endsAt: timestamp('ends_at', {
            mode: 'date',
            withTimezone: true,
        }),
        location: varchar('location', { length: 255 }),
        status: judgingWaveStatusEnum('status').notNull().default('scheduled'),
        /** Soft capacity / target team count for resize + rebalance. */
        targetSize: integer('target_size'),
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
        index('judging_waves_hackathon_id_idx').on(table.hackathonId),
        index('judging_waves_hackathon_status_idx').on(
            table.hackathonId,
            table.status
        ),
    ]
);

export const judgingWaveAssignments = pgTable(
    'judging_wave_assignments',
    {
        waveId: integer('wave_id')
            .notNull()
            .references(() => judgingWaves.id, { onDelete: 'cascade' }),
        teamId: integer('team_id')
            .notNull()
            .references(() => teams.id, { onDelete: 'cascade' }),
        /** Sort order within the wave (reorder / missed → end). */
        position: integer('position').notNull().default(0),
    },
    (table) => [
        primaryKey({ columns: [table.waveId, table.teamId] }),
        uniqueIndex('judging_wave_assignments_team_unique').on(table.teamId),
        index('judging_wave_assignments_wave_position_idx').on(
            table.waveId,
            table.position
        ),
    ]
);

export const insertJudgingWaveSchema = z.object({
    hackathonId: z.number().int(),
    label: z.string().min(1).max(255),
    kind: z.enum(['software', 'hardware']).optional(),
    startsAt: z.coerce.date().optional().nullable(),
    endsAt: z.coerce.date().optional().nullable(),
    location: z.string().max(255).optional().nullable(),
    status: z.enum(['scheduled', 'active', 'done']).optional(),
    targetSize: z.number().int().positive().optional().nullable(),
});

export const updateJudgingWaveSchema = z.object({
    id: z.number().int(),
    label: z.string().min(1).max(255).optional(),
    kind: z.enum(['software', 'hardware']).optional(),
    startsAt: z.coerce.date().optional().nullable(),
    endsAt: z.coerce.date().optional().nullable(),
    location: z.string().max(255).optional().nullable(),
    status: z.enum(['scheduled', 'active', 'done']).optional(),
    targetSize: z.number().int().positive().optional().nullable(),
});

export const assignTeamToWaveSchema = z.object({
    waveId: z.number().int(),
    teamId: z.number().int(),
    position: z.number().int().optional(),
});

export type JudgingWave = typeof judgingWaves.$inferSelect;
export type JudgingWaveAssignment = typeof judgingWaveAssignments.$inferSelect;
