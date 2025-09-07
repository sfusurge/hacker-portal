import { databaseClient } from '@/db/client';
import { company, portalRoleEnum, sponsorTierEnum } from '@/db/schema/company';
import { hackathons } from '@/db/schema/hackathons';
import { UserRoleEnum } from '@/db/schema/users/users';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { getUserData } from './usersRouter';
import { UnauthorizedError } from '../exceptions';

const createCompanySchema = z.object({
    hackathonId: z.number(),
    portalRole: z.enum(['mentor', 'sponsor']),
    sponsorTier: z.enum(['plat', 'gold', 'title']).optional(),
    companyTitle: z.string().optional(),
    skills: z.array(z.string()).optional(),
});

const updateCompanySchema = z.object({
    hackathonId: z.number(),
    portalRole: z.enum(['mentor', 'sponsor']).optional(),
    sponsorTier: z.enum(['plat', 'gold', 'title']).optional(),
    companyTitle: z.string().optional(),
    skills: z.array(z.string()).optional(),
});

const getCompanySchema = z.object({
    hackathonId: z.number().optional(),
});

export const companyRouter = router({
    create: publicProcedure
        .input(createCompanySchema)
        .mutation(async ({ input }) => {
            const user = await getUserData();

            if (!user) {
                throw new UnauthorizedError({
                    email: undefined,
                    role: undefined,
                });
            }

            // Check if user is sponsor, admin, or the record is for themselves
            if (
                user.userRole !== UserRoleEnum.sponsor &&
                user.userRole !== UserRoleEnum.admin
            ) {
                throw new UnauthorizedError({
                    email: user.email,
                    role: user.userRole,
                });
            }

            const result = await databaseClient
                .insert(company)
                .values({
                    hackathonId: input.hackathonId,
                    userId: user.id,
                    portalRole: input.portalRole,
                    sponsorTierEnum: input.sponsorTier,
                    companyTitle: input.companyTitle,
                    skills: input.skills,
                    updatedDate: new Date(),
                })
                .returning();

            return result[0];
        }),

    get: publicProcedure.input(getCompanySchema).query(async ({ input }) => {
        const user = await getUserData();

        if (!user) {
            throw new UnauthorizedError({
                email: undefined,
                role: undefined,
            });
        }

        const whereConditions = [eq(company.userId, user.id)];

        if (input.hackathonId) {
            whereConditions.push(eq(company.hackathonId, input.hackathonId));
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

    upsert: publicProcedure
        .input(createCompanySchema)
        .mutation(async ({ input }) => {
            const user = await getUserData();

            if (!user) {
                throw new UnauthorizedError({
                    email: undefined,
                    role: undefined,
                });
            }

            // Check if user is sponsor, admin, or the record is for themselves
            if (
                user.userRole !== UserRoleEnum.sponsor &&
                user.userRole !== UserRoleEnum.admin
            ) {
                throw new UnauthorizedError({
                    email: user.email,
                    role: user.userRole,
                });
            }

            const result = await databaseClient
                .insert(company)
                .values({
                    hackathonId: input.hackathonId,
                    userId: user.id,
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
