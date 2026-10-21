import { connection, NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getUserData } from '@/server/auth/sessionUser';
import { hasAdminAccess } from '@/lib/auth/roles';
import { hackathonStatisticsTag } from '@/server/statistics/getHackathonStatistics';

export async function GET(request: NextRequest) {
    await connection();

    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    const bearer = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;
    const cronAuthorized =
        Boolean(cronSecret) &&
        (bearer === cronSecret ||
            request.nextUrl.searchParams.get('secret') === cronSecret);

    if (!cronAuthorized) {
        const viewer = await getUserData();
        if (!viewer) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        if (!hasAdminAccess(viewer.userRole)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
    }

    const hackathonId = parseInt(
        request.nextUrl.searchParams.get('hackathonId') || '1',
        10
    );

    if (!Number.isFinite(hackathonId)) {
        return NextResponse.json(
            { error: 'Invalid hackathonId' },
            { status: 400 }
        );
    }

    revalidateTag(hackathonStatisticsTag(hackathonId), 'max');

    return NextResponse.json({
        success: true,
        message: `Statistics cache refreshed for hackathon ${hackathonId}`,
    });
}
