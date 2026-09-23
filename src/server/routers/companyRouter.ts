import { databaseClient } from '@/db/client';
import { company } from '@/db/schema/company';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { adminProcedure, protectedProcedure, router } from '../trpc';

const createCompanySchema = z.object({
    hackathonId: z.number(),
    portalRole: z.enum(['mentor', 'sponsor']),
    sponsorTier: z.enum(['plat', 'gold', 'title']).optional(),
    companyTitle: z.string().optional(),
    skills: z.array(z.string()).optional(),
});

const getCompanySchema = z.object({
    hackathonId: z.number().optional(),
});

export const companyRouter = router({
    create: adminProcedure
        .input(createCompanySchema)
        .mutation(async ({ input, ctx }) => {
            const result = await databaseClient
                .insert(company)
                .values({
                    hackathonId: input.hackathonId,
                    userId: ctx.user.id,
                    portalRole: input.portalRole,
                    sponsorTierEnum: input.sponsorTier,
                    companyTitle: input.companyTitle,
                    skills: input.skills,
                    updatedDate: new Date(),
                })
                .returning();

            return result[0];
        }),

    get: protectedProcedure
        .input(getCompanySchema)
        .query(async ({ input, ctx }) => {
            const whereConditions = [eq(company.userId, ctx.user.id)];

            if (input.hackathonId) {
                whereConditions.push(
                    eq(company.hackathonId, input.hackathonId)
                );
            }

            const result = await databaseClient
                .select({
                    hackathonId: company.hackathonId,
                    userId: company.userId,
                    portalRole: company.portalRole,
                    sponsorTier: company.sponsorTierEnum,
                    companyTitle: company.companyTitle,
                    skills: company.skills,
                    createdDate: company.createdDate,
                    updatedDate: company.updatedDate,
                })
                .from(company)
                .where(and(...whereConditions));

            return input.hackathonId ? result[0] || null : result;
        }),

    upsert: adminProcedure
        .input(createCompanySchema)
        .mutation(async ({ input, ctx }) => {
            const result = await databaseClient
                .insert(company)
                .values({
                    hackathonId: input.hackathonId,
                    userId: ctx.user.id,
                    portalRole: input.portalRole,
                    sponsorTierEnum: input.sponsorTier,
                    companyTitle: input.companyTitle,
                    skills: input.skills,
                    updatedDate: new Date(),
                })
                .onConflictDoUpdate({
                    target: [company.hackathonId, company.userId],
                    set: {
                        portalRole: input.portalRole,
                        sponsorTierEnum: input.sponsorTier,
                        companyTitle: input.companyTitle,
                        skills: input.skills,
                        updatedDate: new Date(),
                    },
                })
                .returning();

            return result[0];
        }),
});
