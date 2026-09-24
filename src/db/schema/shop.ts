import {
    index,
    integer,
    pgTable,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { hackathons } from './hackathons';
import { user } from './users/users';

export const shopItems = pgTable(
    'shop_items',
    {
        id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
        hackathonId: integer('hackathon_id')
            .notNull()
            .references(() => hackathons.id, { onDelete: 'cascade' }),
        name: varchar('name', { length: 256 }).notNull(),
        description: text('description').notNull().default(''),
        cost: integer('cost').notNull(),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => [index().on(table.hackathonId)]
);

export const shopPurchases = pgTable(
    'shop_purchases',
    {
        id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
        hackathonId: integer('hackathon_id')
            .notNull()
            .references(() => hackathons.id, { onDelete: 'cascade' }),
        itemId: integer('item_id').references(() => shopItems.id, {
            onDelete: 'set null',
        }),
        userId: integer('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        itemName: varchar('item_name', { length: 256 }).notNull(),
        pointsSpent: integer('points_spent').notNull(),
        quantity: integer('quantity').notNull().default(1),
        note: text('note'),
        createdByAdminId: integer('created_by_admin_id').references(
            () => user.id,
            { onDelete: 'set null' }
        ),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        index().on(table.hackathonId),
        index().on(table.userId),
        index().on(table.itemId),
    ]
);

export const getShopCatalogSchema = z.object({
    hackathonId: z.number().int(),
});

export const getMyBalanceSchema = z.object({
    hackathonId: z.number().int(),
});

export const getMyPurchasesSchema = z.object({
    hackathonId: z.number().int(),
});

export const createShopItemSchema = z.object({
    hackathonId: z.number().int(),
    name: z.string().trim().min(1).max(256),
    description: z.string().max(2048).optional(),
    cost: z.number().int().min(1),
});

export const updateShopItemSchema = z.object({
    itemId: z.number().int(),
    name: z.string().trim().min(1).max(256).optional(),
    description: z.string().max(2048).optional(),
    cost: z.number().int().min(1).optional(),
});

export const deleteShopItemSchema = z.object({
    itemId: z.number().int(),
});

export const listShopItemsSchema = z.object({
    hackathonId: z.number().int(),
});

export const listPurchasesSchema = z.object({
    hackathonId: z.number().int(),
});

const shopItemImportRowSchema = z.object({
    name: z.string().trim().min(1).max(256),
    description: z.string().max(2048).optional(),
    cost: z.number().int().min(1),
});

export const importShopItemsSchema = z.object({
    hackathonId: z.number().int(),
    items: z.array(shopItemImportRowSchema).min(1).max(500),
});
