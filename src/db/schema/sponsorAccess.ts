import {
    boolean,
    index,
    integer,
    pgTable,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';

// Per-sponsor activate tokens (plain token stored so links can be rebuilt).
export const sponsorAccessTokens = pgTable(
    'sponsor_access_tokens',
    {
        id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
        name: varchar('name', { length: 255 }).notNull(),
        token: varchar('token', { length: 128 }).notNull().unique(),
        hackathonId: integer('hackathon_id').references(() => hackathons.id),
        revoked: boolean('revoked').notNull().default(false),
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
        index('sponsor_access_tokens_hackathon_id_idx').on(table.hackathonId),
    ]
);

export type SponsorAccessToken = typeof sponsorAccessTokens.$inferSelect;
