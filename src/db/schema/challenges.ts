import {
    boolean,
    index,
    integer,
    pgTable,
    primaryKey,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { hackathons } from './hackathons';
import { events } from './events';
import { user } from './users/users';

export const challenges = pgTable(
    'challenges',
    {
        id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
        hackathonId: integer('hackathon_id')
            .notNull()
            .references(() => hackathons.id),
        title: varchar('title', { length: 1024 }).notNull(),
        description: varchar('description', { length: 2048 }).default(''),
        longDescription: text('long_description'),
        color: varchar('color', { length: 128 }).notNull().default('#6466F1'),
        lowestPoints: integer('lowest_points').notNull().default(5),
        highestPoints: integer('highest_points').notNull().default(5),
        maxCompletions: integer('max_completions').notNull().default(1),
        variablePoints: boolean('variable_points').notNull().default(false),
    },
    (table) => [index().on(table.hackathonId)]
);

/** Many events can feed progress on one challenge */
export const challengeEvents = pgTable(
    'challenge_events',
    {
        challengeId: integer('challenge_id')
            .notNull()
            .references(() => challenges.id, { onDelete: 'cascade' }),
        eventId: integer('event_id')
            .notNull()
            .references(() => events.id, { onDelete: 'cascade' }),
    },
    (table) => [
        primaryKey({ columns: [table.challengeId, table.eventId] }),
        index().on(table.eventId),
    ]
);

export const challengeCompletions = pgTable(
    'challenge_completions',
    {
        challengeId: integer('challenge_id')
            .notNull()
            .references(() => challenges.id, { onDelete: 'cascade' }),
        userId: integer('user_id')
            .notNull()
            .references(() => user.id),
        pointsAwarded: integer('points_awarded').notNull(),
        completedAt: timestamp('completed_at').notNull().defaultNow(),
    },
    (table) => [
        primaryKey({
            columns: [table.challengeId, table.userId],
        }),
        index().on(table.userId),
    ]
);

const pointsFieldsSchema = {
    lowestPoints: z.number().int().min(1).optional(),
    highestPoints: z.number().int().min(1).optional(),
    /** @deprecated Prefer lowestPoints/highestPoints. Mapped to both when set alone. */
    points: z.number().int().min(1).optional(),
    maxCompletions: z.number().int().min(1).optional(),
    variablePoints: z.boolean().optional(),
};

export const insertChallengeSchema = z.object({
    hackathonId: z.number().int(),
    title: z.string().min(1),
    description: z.string().optional(),
    longDescription: z.string().optional(),
    color: z.string().optional(),
    ...pointsFieldsSchema,
    eventIds: z.array(z.number().int()).optional(),
});

export const updateChallengeSchema = z.object({
    challengeId: z.number().int(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    longDescription: z.string().nullable().optional(),
    color: z.string().optional(),
    ...pointsFieldsSchema,
    eventIds: z.array(z.number().int()).optional(),
});

export const deleteChallengeSchema = z.object({
    challengeId: z.number().int(),
});

export const getChallengesSchema = z.object({
    hackathonId: z.number().int(),
});

export const completeChallengeSchema = z.object({
    challengeId: z.number().int(),
    userId: z.number().int(),
    pointsAwarded: z.number().int().optional(),
});

export const isChallengeCompleteSchema = z.object({
    challengeId: z.number().int(),
    userId: z.number().int(),
});

const challengeImportRowSchema = z.object({
    title: z.string().trim().min(1).max(1024),
    description: z.string().max(2048).optional(),
    longDescription: z.string().optional(),
    color: z.string().max(128).optional(),
    ...pointsFieldsSchema,
    eventIds: z.array(z.number().int()).optional(),
});

export const importChallengesSchema = z.object({
    hackathonId: z.number().int(),
    challenges: z.array(challengeImportRowSchema).min(1).max(500),
});

/** Resolve stored min/max from API input (supports legacy `points`). */
export function resolveChallengePointBounds(input: {
    lowestPoints?: number;
    highestPoints?: number;
    points?: number;
    variablePoints?: boolean;
}): { lowestPoints: number; highestPoints: number; variablePoints: boolean } {
    const variablePoints = input.variablePoints ?? false;
    const legacy = input.points;

    let lowest =
        input.lowestPoints ??
        (variablePoints ? 1 : (legacy ?? input.highestPoints ?? 5));
    let highest = input.highestPoints ?? legacy ?? input.lowestPoints ?? 5;

    if (!variablePoints) {
        // Fixed award: both bounds are the same unit value.
        const unit = input.highestPoints ?? input.lowestPoints ?? legacy ?? 5;
        lowest = unit;
        highest = unit;
    }

    lowest = Math.max(1, Math.floor(lowest));
    highest = Math.max(lowest, Math.floor(highest));

    return { lowestPoints: lowest, highestPoints: highest, variablePoints };
}
