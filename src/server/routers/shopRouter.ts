import { databaseClient } from '@/db/client';
import {
    createShopItemSchema,
    deleteShopItemSchema,
    getMyBalanceSchema,
    getMyPurchasesSchema,
    getShopCatalogSchema,
    importShopItemsSchema,
    listPurchasesSchema,
    listShopItemsSchema,
    shopItems,
    shopPurchases,
    updateShopItemSchema,
} from '@/db/schema/shop';
import { user as usersTable } from '@/db/schema/users/users';
import {
    countPurchasesForItem,
    getPointsBalance,
} from '@/server/points/balance';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq } from 'drizzle-orm';
import { adminProcedure, protectedProcedure, router } from '../trpc';

async function getItemOrThrow(itemId: number) {
    const [item] = await databaseClient
        .select()
        .from(shopItems)
        .where(eq(shopItems.id, itemId))
        .limit(1);

    if (!item) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Shop item not found',
        });
    }
    return item;
}

export const shopRouter = router({
    getMyBalance: protectedProcedure
        .input(getMyBalanceSchema)
        .query(async ({ ctx, input }) => {
            return getPointsBalance(input.hackathonId, ctx.user.id);
        }),

    getCatalog: protectedProcedure
        .input(getShopCatalogSchema)
        .query(async ({ input }) => {
            return databaseClient
                .select()
                .from(shopItems)
                .where(eq(shopItems.hackathonId, input.hackathonId))
                .orderBy(asc(shopItems.cost), asc(shopItems.name));
        }),

    getMyPurchases: protectedProcedure
        .input(getMyPurchasesSchema)
        .query(async ({ ctx, input }) => {
            return databaseClient
                .select({
                    id: shopPurchases.id,
                    itemId: shopPurchases.itemId,
                    itemName: shopPurchases.itemName,
                    pointsSpent: shopPurchases.pointsSpent,
                    quantity: shopPurchases.quantity,
                    note: shopPurchases.note,
                    createdAt: shopPurchases.createdAt,
                })
                .from(shopPurchases)
                .where(
                    and(
                        eq(shopPurchases.hackathonId, input.hackathonId),
                        eq(shopPurchases.userId, ctx.user.id)
                    )
                )
                .orderBy(desc(shopPurchases.createdAt));
        }),

    listItems: adminProcedure
        .input(listShopItemsSchema)
        .query(async ({ input }) => {
            return databaseClient
                .select()
                .from(shopItems)
                .where(eq(shopItems.hackathonId, input.hackathonId))
                .orderBy(asc(shopItems.name));
        }),

    createItem: adminProcedure
        .input(createShopItemSchema)
        .mutation(async ({ input }) => {
            const [created] = await databaseClient
                .insert(shopItems)
                .values({
                    hackathonId: input.hackathonId,
                    name: input.name,
                    description: input.description ?? '',
                    cost: input.cost,
                })
                .returning();
            return created;
        }),

    importItems: adminProcedure
        .input(importShopItemsSchema)
        .mutation(async ({ input }) => {
            const created = await databaseClient
                .insert(shopItems)
                .values(
                    input.items.map((item) => ({
                        hackathonId: input.hackathonId,
                        name: item.name,
                        description: item.description ?? '',
                        cost: item.cost,
                    }))
                )
                .returning();

            return { created: created.length };
        }),

    updateItem: adminProcedure
        .input(updateShopItemSchema)
        .mutation(async ({ input }) => {
            await getItemOrThrow(input.itemId);

            const [updated] = await databaseClient
                .update(shopItems)
                .set({
                    ...(input.name != null ? { name: input.name } : {}),
                    ...(input.description != null
                        ? { description: input.description }
                        : {}),
                    ...(input.cost != null ? { cost: input.cost } : {}),
                    updatedAt: new Date(),
                })
                .where(eq(shopItems.id, input.itemId))
                .returning();

            return updated;
        }),

    deleteItem: adminProcedure
        .input(deleteShopItemSchema)
        .mutation(async ({ input }) => {
            const sold = await countPurchasesForItem(input.itemId);
            if (sold > 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Cannot delete an item with purchases.',
                });
            }

            const [deleted] = await databaseClient
                .delete(shopItems)
                .where(eq(shopItems.id, input.itemId))
                .returning();

            if (!deleted) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Shop item not found',
                });
            }
            return deleted;
        }),

    listPurchases: adminProcedure
        .input(listPurchasesSchema)
        .query(async ({ input }) => {
            return databaseClient
                .select({
                    id: shopPurchases.id,
                    itemId: shopPurchases.itemId,
                    itemName: shopPurchases.itemName,
                    pointsSpent: shopPurchases.pointsSpent,
                    quantity: shopPurchases.quantity,
                    note: shopPurchases.note,
                    createdAt: shopPurchases.createdAt,
                    userId: usersTable.id,
                    firstName: usersTable.firstName,
                    lastName: usersTable.lastName,
                    email: usersTable.email,
                    displayId: usersTable.displayId,
                })
                .from(shopPurchases)
                .innerJoin(usersTable, eq(usersTable.id, shopPurchases.userId))
                .where(eq(shopPurchases.hackathonId, input.hackathonId))
                .orderBy(desc(shopPurchases.createdAt));
        }),
});
