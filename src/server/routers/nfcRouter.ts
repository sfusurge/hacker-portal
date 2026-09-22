import { databaseClient } from '@/db/client';
import {
    bindNfcCardSchema,
    getNfcCardByTagUidSchema,
    getNfcCardByUserIdSchema,
    nfcCards,
} from '@/db/schema/nfcCards';
import { user as usersTable } from '@/db/schema/users/users';
import { and, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { adminProcedure, router } from '../trpc';

function normalizeTagUid(tagUid: string): string {
    return tagUid.replace(/[:\s.-]/g, '').toUpperCase();
}

export const nfcRouter = router({
    /**
     * Bind an NFC tag UID to a portal user (1:1 per hackathon).
     * Re-provisioning the same user replaces their previous tag for that hackathon.
     * Reusing a tag already bound to someone else is rejected.
     */
    bindCard: adminProcedure
        .input(bindNfcCardSchema)
        .mutation(async ({ input }) => {
            const tagUid = normalizeTagUid(input.tagUid);

            const [targetUser] = await databaseClient
                .select({ id: usersTable.id })
                .from(usersTable)
                .where(eq(usersTable.id, input.userId))
                .limit(1);

            if (!targetUser) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Cannot find user with id ${input.userId}`,
                });
            }

            const [existingByUid] = await databaseClient
                .select()
                .from(nfcCards)
                .where(eq(nfcCards.tagUid, tagUid))
                .limit(1);

            if (
                existingByUid &&
                (existingByUid.userId !== input.userId ||
                    existingByUid.hackathonId !== input.hackathonId)
            ) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'NFC tag is already bound to another hacker',
                });
            }

            await databaseClient
                .delete(nfcCards)
                .where(
                    and(
                        eq(nfcCards.userId, input.userId),
                        eq(nfcCards.hackathonId, input.hackathonId)
                    )
                );

            const [row] = await databaseClient
                .insert(nfcCards)
                .values({
                    tagUid,
                    userId: input.userId,
                    hackathonId: input.hackathonId,
                })
                .onConflictDoUpdate({
                    target: nfcCards.tagUid,
                    set: {
                        userId: input.userId,
                        hackathonId: input.hackathonId,
                        provisionedAt: new Date(),
                    },
                })
                .returning();

            return row;
        }),

    getByTagUid: adminProcedure
        .input(getNfcCardByTagUidSchema)
        .query(async ({ input }) => {
            const tagUid = normalizeTagUid(input.tagUid);
            const conditions = [eq(nfcCards.tagUid, tagUid)];
            if (input.hackathonId != null) {
                conditions.push(eq(nfcCards.hackathonId, input.hackathonId));
            }

            const [row] = await databaseClient
                .select()
                .from(nfcCards)
                .where(and(...conditions))
                .limit(1);

            return row ?? null;
        }),

    getByUserId: adminProcedure
        .input(getNfcCardByUserIdSchema)
        .query(async ({ input }) => {
            const [row] = await databaseClient
                .select()
                .from(nfcCards)
                .where(
                    and(
                        eq(nfcCards.userId, input.userId),
                        eq(nfcCards.hackathonId, input.hackathonId)
                    )
                )
                .limit(1);

            return row ?? null;
        }),
});

export type NfcRouter = typeof nfcRouter;
