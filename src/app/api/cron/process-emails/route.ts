import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue } from '@/server/email/processEmailQueue';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await processEmailQueue({ respectQuota: true });
        return NextResponse.json(result);
    } catch (err) {
        console.error('Error processing emails:', err);
        throw new Error('Failed to process emails.');
    }
}
