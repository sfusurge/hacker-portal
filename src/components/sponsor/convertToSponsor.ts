'use server';

import { databaseClient } from '@/db/client';
import { user } from '@/db/schema/users/users';
import { eq } from 'drizzle-orm';

export async function convertToSponsor(userId: number, bypassCode: string) {
    try {
        const isValidBypass =
            (process.env.PLATSPONSOR &&
                bypassCode === process.env.PLATSPONSOR) ||
            (process.env.GOLDSPONSOR &&
                bypassCode === process.env.GOLDSPONSOR) ||
            (process.env.TITLESPONSOR &&
                bypassCode === process.env.TITLESPONSOR);

        if (!isValidBypass) {
            return { success: false, error: 'Invalid bypass code' };
        }

        await databaseClient
            .update(user)
            .set({ userRole: 'sponsor' })
            .where(eq(user.id, userId));

        return { success: true };
    } catch (error) {
        console.error('Error converting to sponsor:', error);
        return { success: false, error: 'Failed to convert account' };
    }
}
