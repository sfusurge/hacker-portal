import {
    index,
    integer,
    pgTable,
    timestamp,
    uniqueIndex,
    varchar,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { hackathons } from './hackathons';
import { user } from './users/users';

/**
 * 1:1 mapping between an NFC tag UID and a portal user for a hackathon.
 * Used by HackerNFC check-in provisioning and later tap-based check-ins.
 */
export const nfcCards = pgTable(
    'nfc_cards',
    {
        tagUid: varchar('tag_uid', { length: 64 }).primaryKey(),
        userId: integer('user_id')
            .notNull()
            .references(() => user.id),
        hackathonId: integer('hackathon_id')
            .notNull()
            .references(() => hackathons.id),
        provisionedAt: timestamp('provisioned_at').notNull().defaultNow(),
    },
    (table) => {
        return [
            uniqueIndex('nfc_cards_user_hackathon_uidx').on(
                table.userId,
                table.hackathonId
            ),
            index('nfc_cards_user_id_idx').on(table.userId),
            index('nfc_cards_hackathon_id_idx').on(table.hackathonId),
        ];
    }
);

export const bindNfcCardSchema = z.object({
    tagUid: z
        .string()
        .min(4)
        .max(64)
        .regex(/^[0-9a-fA-F:.-]+$/, 'Invalid NFC tag UID'),
    userId: z.number().int(),
    hackathonId: z.number().int(),
});

export const getNfcCardByTagUidSchema = z.object({
    tagUid: z.string().min(4).max(64),
    hackathonId: z.number().int().optional(),
});

export const getNfcCardByUserIdSchema = z.object({
    userId: z.number().int(),
    hackathonId: z.number().int(),
});
