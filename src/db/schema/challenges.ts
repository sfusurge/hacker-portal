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
        points: integer('points').notNull().default(5),
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

export const insertChallengeSchema = z.object({
    hackathonId: z.number().int(),
    title: z.string().min(1),
    description: z.string().optional(),
    longDescription: z.string().optional(),
    color: z.string().optional(),
    points: z.number().int().min(1).optional(),
    maxCompletions: z.number().int().min(1).optional(),
    variablePoints: z.boolean().optional(),
    eventIds: z.array(z.number().int()).optional(),
});

export const updateChallengeSchema = z.object({
    challengeId: z.number().int(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    longDescription: z.string().nullable().optional(),
    color: z.string().optional(),
    points: z.number().int().min(1).optional(),
    maxCompletions: z.number().int().min(1).optional(),
    variablePoints: z.boolean().optional(),
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
    points: z.number().int().min(1).optional(),
    maxCompletions: z.number().int().min(1).optional(),
    variablePoints: z.boolean().optional(),
    eventIds: z.array(z.number().int()).optional(),
});

export const importChallengesSchema = z.object({
    hackathonId: z.number().int(),
    challenges: z.array(challengeImportRowSchema).min(1).max(500),
});
