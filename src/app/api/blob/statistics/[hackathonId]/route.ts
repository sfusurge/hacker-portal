import { NextRequest, NextResponse } from 'next/server';
import { head } from '@vercel/blob';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ hackathonId: string }> }
) {
    try {
        const { hackathonId } = await params;

        try {
            const blobPath = `statistics/${hackathonId}/stats.json`;
            const blobInfo = await head(blobPath);

            if (!blobInfo) {
                throw new Error('Statistics data not found');
            }

            const response = await fetch(blobInfo.url);
            const data = await response.json();

            return NextResponse.json({
                success: true,
                data: data,
            });
        } catch (fetchError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Statistics data not found. Please run the cron job first.',
                    data: null,
                },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error reading statistics data:', error);
        return NextResponse.json(
            { error: 'Failed to read statistics data' },
            { status: 500 }
        );
    }
}
