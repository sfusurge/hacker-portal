import {
    index,
    integer,
    pgTable,
    primaryKey,
    timestamp,
    unique,
    varchar,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { hackathons } from './hackathons';
import { user } from './users/users';

export const HOUSES_PER_HACKATHON = 10;

export const houses = pgTable(
    'houses',
    {
        id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
        hackathonId: integer('hackathon_id')
            .notNull()
            .references(() => hackathons.id, { onDelete: 'cascade' }),
        name: varchar('name', { length: 128 }).notNull(),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        index().on(table.hackathonId),
        unique().on(table.hackathonId, table.name),
    ]
);

export const houseMemberships = pgTable(
    'house_memberships',
    {
        hackathonId: integer('hackathon_id')
            .notNull()
            .references(() => hackathons.id, { onDelete: 'cascade' }),
        houseId: integer('house_id')
            .notNull()
            .references(() => houses.id, { onDelete: 'cascade' }),
        userId: integer('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        assignedAt: timestamp('assigned_at').notNull().defaultNow(),
    },
    (table) => [
        primaryKey({ columns: [table.houseId, table.userId] }),
        unique().on(table.hackathonId, table.userId),
        index().on(table.userId),
        index().on(table.houseId),
    ]
);

export const createHousesSchema = z.object({
    hackathonId: z.number().int(),
    names: z
        .array(z.string().min(1).max(128))
        .length(HOUSES_PER_HACKATHON)
        .describe(`Exactly ${HOUSES_PER_HACKATHON} house names`),
});

export const getHousesSchema = z.object({
    hackathonId: z.number().int(),
});

export const assignHousesSchema = z.object({
    hackathonId: z.number().int(),
});

export const getHouseForUserSchema = z.object({
    hackathonId: z.number().int(),
    userId: z.number().int(),
});

export const getHouseStandingsSchema = z.object({
    hackathonId: z.number().int(),
});
