import {
    boolean,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { hackathons } from './hackathons';

export const announcementSourceEnum = pgEnum('announcement_source', [
    'discord',
]);

export const announcements = pgTable(
    'announcements',
    {
        id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
        hackathonId: integer('hackathon_id')
            .notNull()
            .references(() => hackathons.id, { onDelete: 'restrict' }),
        source: announcementSourceEnum('source').notNull().default('discord'),
        sourceMessageId: varchar('source_message_id', { length: 64 }).notNull(),
        sourceChannelId: varchar('source_channel_id', { length: 64 }).notNull(),
        sourceGuildId: varchar('source_guild_id', { length: 64 }).notNull(),
        sourceAuthorId: varchar('source_author_id', { length: 64 }).notNull(),
        idempotencyKey: varchar('idempotency_key', { length: 128 }).notNull(),
        content: text('content').notNull(),
        rawPayload: jsonb('raw_payload')
            .$type<Record<string, unknown> | null>()
            .default(null),
        sourceTimestamp: timestamp('source_timestamp', {
            mode: 'date',
            withTimezone: true,
        }).notNull(),
        isArchived: boolean('is_archived').notNull().default(false),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => {
        return [
            uniqueIndex('announcements_source_message_unique').on(
                table.source,
                table.sourceMessageId
            ),
            uniqueIndex('announcements_idempotency_key_unique').on(
                table.idempotencyKey
            ),
            index().on(table.hackathonId, table.createdAt),
            index().on(table.sourceChannelId),
        ];
    }
);

export const announcementChannelMappings = pgTable(
    'announcement_channel_mappings',
    {
        id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
        discordChannelId: varchar('discord_channel_id', {
            length: 64,
        }).notNull(),
        discordGuildId: varchar('discord_guild_id', { length: 64 }).notNull(),
        hackathonId: integer('hackathon_id')
            .notNull()
            .references(() => hackathons.id, { onDelete: 'restrict' }),
        label: varchar('label', { length: 256 }),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => {
        return [
            uniqueIndex('announcement_channel_mappings_channel_unique').on(
                table.discordChannelId
            ),
            index().on(table.hackathonId),
        ];
    }
);

export const ingestDiscordAnnouncementSchema = z.object({
    channelId: z.string().min(1),
    guildId: z.string().min(1),
    messageId: z.string().min(1),
    authorId: z.string().min(1),
    content: z.string().min(1),
    timestamp: z.string().datetime({ offset: true }),
    idempotencyKey: z.string().min(1).optional(),
    rawPayload: z.record(z.unknown()).optional(),
});

export const selectAnnouncementSchema = createSelectSchema(announcements);
export const insertAnnouncementSchema = createInsertSchema(announcements);

export const selectAnnouncementChannelMappingSchema = createSelectSchema(
    announcementChannelMappings
);
export const insertAnnouncementChannelMappingSchema = createInsertSchema(
    announcementChannelMappings
);

export const listAnnouncementsByHackathonSchema = z.object({
    hackathonId: z.number().int(),
    limit: z.number().int().min(1).max(100).default(25),
    offset: z.number().int().min(0).default(0),
});

export const getChannelMappingByChannelSchema = z.object({
    discordChannelId: z.string().min(1),
});
