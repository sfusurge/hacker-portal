import {
    index,
    integer,
    pgTable,
    primaryKey,
    timestamp,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { hackathons } from './hackathons';
import { judgingKindEnum } from './judgingKind';
import { user } from './users/users';

/**
 * Per-hackathon judge roster + specialty.
 * Random assignment only pairs software judges with software projects
 * (and hardware with hardware).
 */
export const hackathonJudges = pgTable(
    'hackathon_judges',
    {
        hackathonId: integer('hackathon_id')
            .notNull()
            .references(() => hackathons.id, { onDelete: 'cascade' }),
        userId: integer('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
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
        primaryKey({ columns: [table.hackathonId, table.userId] }),
        index('hackathon_judges_hackathon_kind_idx').on(
            table.hackathonId,
            table.kind
        ),
    ]
);

export const upsertHackathonJudgeSchema = z.object({
    hackathonId: z.number().int(),
    userId: z.number().int(),
    kind: z.enum(['software', 'hardware']),
});

export type HackathonJudge = typeof hackathonJudges.$inferSelect;
