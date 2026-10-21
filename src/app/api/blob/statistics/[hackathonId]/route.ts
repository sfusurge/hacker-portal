import { NextResponse } from 'next/server';
import { getHackathonStatistics } from '@/server/statistics/getHackathonStatistics';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ hackathonId: string }> }
) {
    const { hackathonId: rawId } = await params;
    const hackathonId = parseInt(rawId, 10);

    if (!Number.isFinite(hackathonId)) {
        return NextResponse.json(
            { success: false, error: 'Invalid hackathonId', data: null },
            { status: 400 }
        );
    }

    try {
        const data = await getHackathonStatistics(hackathonId);

        if (!data) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Hackathon ${hackathonId} not found`,
                    data: null,
                },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error reading statistics data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to read statistics data',
                data: null,
            },
            { status: 500 }
        );
    }
}
