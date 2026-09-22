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
import { createUpdateSchema } from 'drizzle-zod';
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
        eventId: integer('event_id').references(() => events.id, {
            onDelete: 'set null',
        }),
        title: varchar('title', { length: 1024 }).notNull(),
        description: varchar('description', { length: 2048 }).default(''),
        longDescription: text('long_description'),
        color: varchar('color', { length: 128 }).notNull().default('#6466F1'),
        points: integer('points').notNull().default(5),
        maxCompletions: integer('max_completions').notNull().default(1),
        variablePoints: boolean('variable_points').notNull().default(false),
    },
    (table) => [index().on(table.hackathonId), index().on(table.eventId)]
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
    eventId: z.number().int().nullable().optional(),
});

export const updateChallengeSchema = createUpdateSchema(challenges)
    .omit({ hackathonId: true })
    .extend({
        challengeId: z.number().int(),
        eventId: z.number().int().nullable().optional(),
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
