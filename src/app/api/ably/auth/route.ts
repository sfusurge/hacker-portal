import { getSession, SessionType } from '@/auth/auth';
import { databaseClient } from '@/db/client';
import { applications } from '@/db/schema/applications';
import { UserRoleEnum } from '@/db/schema/users/users';
import { createAblyTokenRequest } from '@/lib/realtime/createAblyTokenRequest';
import { getUserData } from '@/server/routers/usersRouter';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const session = (await getSession()) as SessionType;
    if (!session?.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.userId, 10);
    if (Number.isNaN(userId)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await getUserData();
    if (!userData) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const hackathonIdRaw = searchParams.get('hackathonId');
    if (hackathonIdRaw == null || hackathonIdRaw === '') {
        return NextResponse.json(
            { error: 'Missing hackathonId' },
            { status: 400 }
        );
    }

    const hackathonId = parseInt(hackathonIdRaw, 10);
    if (Number.isNaN(hackathonId)) {
        return NextResponse.json(
            { error: 'Invalid hackathonId' },
            { status: 400 }
        );
    }

    const isAdmin = userData.userRole === UserRoleEnum.admin;

    const [applicationRow] = await databaseClient
        .select({ userId: applications.userId })
        .from(applications)
        .where(
            and(
                eq(applications.hackathonId, hackathonId),
                eq(applications.userId, userId)
            )
        )
        .limit(1);

    const hasApplicationForHackathon = Boolean(applicationRow);

    if (!isAdmin && !hasApplicationForHackathon) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tokenRequest = await createAblyTokenRequest({
        userId,
        hackathonId,
        isAdmin,
        hasApplicationForHackathon,
    });

    if (!tokenRequest) {
        return NextResponse.json(
            { error: 'Realtime unavailable' },
            { status: 503 }
        );
    }

    return NextResponse.json(tokenRequest);
}
