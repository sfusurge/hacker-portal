import {
    index,
    integer,
    pgTable,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { hackathons } from './hackathons';
import { judgingKindEnum } from './judgingKind';
import { user } from './users/users';

/** Shareable /judge/join?token=… links that grant the judge role. */
export const judgeInviteTokens = pgTable(
    'judge_invite_tokens',
    {
        id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
        token: varchar('token', { length: 128 }).notNull().unique(),
        hackathonId: integer('hackathon_id')
            .notNull()
            .references(() => hackathons.id, { onDelete: 'cascade' }),
        createdBy: integer('created_by').references(() => user.id, {
            onDelete: 'set null',
        }),
        /** Judges who join via this link get this specialty on hackathon_judges. */
        kind: judgingKindEnum('kind').notNull().default('software'),
        expiresAt: timestamp('expires_at', {
            mode: 'date',
            withTimezone: true,
        }),
        maxUses: integer('max_uses'),
        useCount: integer('use_count').notNull().default(0),
        revokedAt: timestamp('revoked_at', {
            mode: 'date',
            withTimezone: true,
        }),
        createdAt: timestamp('created_at', {
            mode: 'date',
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index('judge_invite_tokens_hackathon_id_idx').on(table.hackathonId),
        index('judge_invite_tokens_token_idx').on(table.token),
    ]
);

export const insertJudgeInviteTokenSchema = z.object({
    hackathonId: z.number().int(),
    kind: z.enum(['software', 'hardware']).optional(),
    expiresAt: z.coerce.date().optional().nullable(),
    maxUses: z.number().int().positive().optional().nullable(),
});

export type JudgeInviteToken = typeof judgeInviteTokens.$inferSelect;
