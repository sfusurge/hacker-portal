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
        mentionMetadata: jsonb('mention_metadata')
            .$type<DiscordMentionMetadata | null>()
            .default(null),
        sourceTimestamp: timestamp('source_timestamp', {
            mode: 'date',
            withTimezone: true,
        }).notNull(),
        // mirrors Discord's `Message.editedTimestamp`; null = not edited
        lastEditedAt: timestamp('last_edited_at', {
            mode: 'date',
            withTimezone: true,
        }),
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

export const announcementAttachments = pgTable(
    'announcement_attachments',
    {
        id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
        announcementId: integer('announcement_id')
            .notNull()
            .references(() => announcements.id, { onDelete: 'cascade' }),
        // TODO: Discord CDN URLs expire after a while so probably find a way to mirror to another CDN or something
        sourceUrl: text('source_url').notNull(),
        storedUrl: text('stored_url'),
        storageProvider: varchar('storage_provider', { length: 32 }),
        storageKey: text('storage_key'),
        uploadedAt: timestamp('uploaded_at', {
            mode: 'date',
            withTimezone: true,
        }),
        filename: varchar('filename', { length: 256 }),
        contentType: varchar('content_type', { length: 128 }),
        sizeBytes: integer('size_bytes'),
        width: integer('width'),
        height: integer('height'),
        position: integer('position').notNull().default(0), // order of attachements
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => {
        return [index().on(table.announcementId)];
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

export const ingestDiscordAttachmentSchema = z.object({
    url: z.string().url(),
    filename: z.string().max(256).nullable().optional(),
    contentType: z.string().max(128).nullable().optional(),
    sizeBytes: z.number().int().nonnegative().nullable().optional(),
    width: z.number().int().nonnegative().nullable().optional(),
    height: z.number().int().nonnegative().nullable().optional(),
});

export const discordMentionUserSchema = z.object({
    displayName: z.string().min(1),
    username: z.string().min(1),
});

export const discordMentionRoleSchema = z.object({
    name: z.string().min(1),
});

export const discordMentionChannelSchema = z.object({
    name: z.string().min(1),
    type: z.number().int(),
});

export const discordMentionMetadataSchema = z.object({
    users: z.record(z.string().min(1), discordMentionUserSchema),
    roles: z.record(z.string().min(1), discordMentionRoleSchema),
    channels: z.record(z.string().min(1), discordMentionChannelSchema),
});

export type DiscordMentionMetadata = z.infer<
    typeof discordMentionMetadataSchema
>;

export const ingestDiscordAnnouncementSchema = z
    .object({
        channelId: z.string().min(1),
        guildId: z.string().min(1),
        messageId: z.string().min(1),
        authorId: z.string().min(1),
        content: z.string(),
        timestamp: z.string().datetime({ offset: true }),
        editedTimestamp: z
            .string()
            .datetime({ offset: true })
            .nullable()
            .optional(),
        attachments: z
            .array(ingestDiscordAttachmentSchema)
            .optional()
            .default([]),
        mentions: discordMentionMetadataSchema
            .optional()
            .default({ users: {}, roles: {}, channels: {} }),
        idempotencyKey: z.string().min(1).optional(),
        rawPayload: z.record(z.unknown()).optional(),
    })
    .refine(
        (value) =>
            value.content.trim().length > 0 || value.attachments.length > 0,
        {
            message: 'Either content or at least one attachment is required',
            path: ['content'],
        }
    );

export const selectAnnouncementSchema = createSelectSchema(announcements);
export const insertAnnouncementSchema = createInsertSchema(announcements);

export const selectAnnouncementAttachmentSchema = createSelectSchema(
    announcementAttachments
);
export const insertAnnouncementAttachmentSchema = createInsertSchema(
    announcementAttachments
);

export type AnnouncementWithAttachments = typeof announcements.$inferSelect & {
    attachments: Array<typeof announcementAttachments.$inferSelect>;
};

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

export const deleteDiscordAnnouncementSchema = z.object({
    messageId: z.string().min(1),
    channelId: z.string().min(1).optional(),
    guildId: z.string().min(1).optional(),
    idempotencyKey: z.string().min(1).optional(),
});
