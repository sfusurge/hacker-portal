'use server';

import { databaseClient } from '@/db/client';
import { user } from '@/db/schema/users/users';
import { company } from '@/db/schema/company';
import { hackathons } from '@/db/schema/hackathons';
import { eq, asc } from 'drizzle-orm';
import { getUserData } from '@/server/auth/sessionUser';

export async function convertToSponsor(
    bypassCode: string,
    companyTitle: string
) {
    try {
        const normalizedCompanyTitle = companyTitle.trim();
        if (!normalizedCompanyTitle || normalizedCompanyTitle.length > 255) {
            return { success: false, error: 'Enter a valid company title.' };
        }

        const sponsorTier =
            bypassCode === process.env.PLATSPONSOR && process.env.PLATSPONSOR
                ? 'plat'
                : bypassCode === process.env.GOLDSPONSOR &&
                    process.env.GOLDSPONSOR
                  ? 'gold'
                  : bypassCode === process.env.TITLESPONSOR &&
                      process.env.TITLESPONSOR
                    ? 'title'
                    : null;
        if (!sponsorTier) {
            return { success: false, error: 'Invalid bypass code' };
        }

        const sessionUser = await getUserData();
        if (!sessionUser) {
            return { success: false, error: 'You must be signed in.' };
        }

        const [activeHackathon] = await databaseClient
            .select({ id: hackathons.id })
            .from(hackathons)
            .where(eq(hackathons.isActive, true))
            .orderBy(asc(hackathons.startDate))
            .limit(1);
        if (!activeHackathon) {
            return { success: false, error: 'No active hackathon found.' };
        }

        await databaseClient.transaction(async (tx) => {
            await tx
                .update(user)
                .set({ userRole: 'sponsor' })
                .where(eq(user.id, sessionUser.id));

            await tx
                .insert(company)
                .values({
                    hackathonId: activeHackathon.id,
                    userId: sessionUser.id,
                    portalRole: 'sponsor',
                    sponsorTierEnum: sponsorTier,
                    companyTitle: normalizedCompanyTitle,
                    updatedDate: new Date(),
                })
                .onConflictDoUpdate({
                    target: [company.hackathonId, company.userId],
                    set: {
                        portalRole: 'sponsor',
                        sponsorTierEnum: sponsorTier,
                        companyTitle: normalizedCompanyTitle,
                        updatedDate: new Date(),
                    },
                });
        });

        return { success: true, sponsorTier };
    } catch (error) {
        console.error('Error converting to sponsor:', error);
        return { success: false, error: 'Failed to convert account' };
    }
}
