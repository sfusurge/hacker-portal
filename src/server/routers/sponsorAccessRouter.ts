import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { adminProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import { sponsorAccessTokens } from '@/db/schema/sponsorAccess';
import { generateSponsorToken } from '@/lib/sponsor/tokenCrypto';

function activatePathFor(token: string) {
    return `/sponsor/activate?token=${encodeURIComponent(token)}`;
}

export const sponsorAccessRouter = router({
    list: adminProcedure.query(async () => {
        const rows = await databaseClient
            .select({
                id: sponsorAccessTokens.id,
                name: sponsorAccessTokens.name,
                token: sponsorAccessTokens.token,
                hackathonId: sponsorAccessTokens.hackathonId,
                revoked: sponsorAccessTokens.revoked,
                createdAt: sponsorAccessTokens.createdAt,
            })
            .from(sponsorAccessTokens)
            .orderBy(desc(sponsorAccessTokens.createdAt));

        return rows.map((row) => ({
            ...row,
            activatePath: activatePathFor(row.token),
        }));
    }),

    // Create sponsor token (stored so the activate link can be rebuilt).
    create: adminProcedure
        .input(
            z.object({
                name: z.string().trim().min(1).max(255),
                hackathonId: z.number().int().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const token = generateSponsorToken();

            const [row] = await databaseClient
                .insert(sponsorAccessTokens)
                .values({
                    name: input.name,
                    token,
                    hackathonId: input.hackathonId,
                })
                .returning({
                    id: sponsorAccessTokens.id,
                    name: sponsorAccessTokens.name,
                    token: sponsorAccessTokens.token,
                    hackathonId: sponsorAccessTokens.hackathonId,
                });

            return {
                ...row,
                activatePath: activatePathFor(row.token),
            };
        }),

    revoke: adminProcedure
        .input(z.object({ id: z.number().int() }))
        .mutation(async ({ input }) => {
            const [row] = await databaseClient
                .update(sponsorAccessTokens)
                .set({ revoked: true, updatedAt: new Date() })
                .where(eq(sponsorAccessTokens.id, input.id))
                .returning({ id: sponsorAccessTokens.id });

            if (!row) {
                throw new TRPCError({ code: 'NOT_FOUND' });
            }
            return { ok: true as const };
        }),
});
