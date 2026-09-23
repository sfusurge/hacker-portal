import { connection, NextRequest, NextResponse } from 'next/server';
import { databaseClient } from '@/db/client';
import { applications } from '@/db/schema/applications';
import { hackathons } from '@/db/schema/hackathons';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { getUserData } from '@/server/auth/sessionUser';
import { hasAdminAccess } from '@/lib/auth/roles';
import {
    buildDemographicPieCharts,
    type ApplicationForStats,
} from '@/lib/statistics/buildDemographicStats';

export async function GET(request: NextRequest) {
    await connection();

    const viewer = await getUserData();
    if (!viewer) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasAdminAccess(viewer.userRole)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const hackathonId = parseInt(
        request.nextUrl.searchParams.get('hackathonId') || '1'
    );

    if (!Number.isFinite(hackathonId)) {
        return NextResponse.json(
            { error: 'Invalid hackathonId' },
            { status: 400 }
        );
    }

    try {
        const [hackathon] = await databaseClient
            .select({
                id: hackathons.id,
                applicationQuestions: hackathons.applicationQuestions,
            })
            .from(hackathons)
            .where(eq(hackathons.id, hackathonId));

        if (!hackathon) {
            return NextResponse.json(
                { error: `Hackathon ${hackathonId} not found` },
                { status: 404 }
            );
        }

        const applicationsResult = await databaseClient
            .select({
                userId: applications.userId,
                response: applications.response,
                currentStatus: applications.currentStatus,
            })
            .from(applications)
            .where(eq(applications.hackathonId, hackathonId));

        const allApps: ApplicationForStats[] = applicationsResult.map(
            (app) => ({
                currentStatus: app.currentStatus,
                response:
                    app.response && typeof app.response === 'object'
                        ? (app.response as Record<string, unknown>)
                        : {},
            })
        );

        const acceptedApps = allApps.filter(
            (app) => app.currentStatus === 'Accepted'
        );

        const pages = hackathon.applicationQuestions;
        const datasets = {
            all: buildDemographicPieCharts(pages, allApps),
            accepted: buildDemographicPieCharts(pages, acceptedApps),
        };

        const payload = {
            hackathonId,
            generatedAt: new Date().toISOString(),
            datasets,
        };

        const pieChartBlob = await put(
            `statistics/${hackathonId}/stats.json`,
            JSON.stringify(payload, null, 2),
            {
                access: 'public',
                contentType: 'application/json',
                allowOverwrite: true,
            }
        );

        return NextResponse.json({
            success: true,
            message: `Statistics data uploaded to Vercel Blob for hackathon ${hackathonId}`,
            count: {
                all: allApps.length,
                accepted: acceptedApps.length,
            },
            pieChartDataUrl: pieChartBlob.url,
            data: payload,
        });
    } catch (error) {
        console.error('Error fetching statistics data:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch statistics data',
                details:
                    error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
