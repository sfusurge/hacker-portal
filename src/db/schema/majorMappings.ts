import { integer, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core';

export const majorMappingSourceEnum = [
    'alias',
    'fuzzy',
    'llm',
    'manual',
] as const;

export type MajorMappingSource = (typeof majorMappingSourceEnum)[number];

export const majorMappings = pgTable('major_mappings', {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    rawKey: text('raw_key').notNull().unique(),
    rawText: text('raw_text').notNull(),
    canonical: text('canonical').notNull(),
    source: text('source').$type<MajorMappingSource>().notNull(),
    confidence: real('confidence'),
    createdAt: timestamp('created_at', {
        mode: 'date',
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', {
        mode: 'date',
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),
});

export type MajorMapping = typeof majorMappings.$inferSelect;
export type InsertMajorMapping = typeof majorMappings.$inferInsert;
