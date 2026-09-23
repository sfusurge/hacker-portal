import { createCaller } from '@/server/appRouter';
import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import Scan from './checkin_components/Scan';
import { EventType } from '@/db/schema/events';

interface QRScanProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function QRScan({ searchParams }: QRScanProps) {
    const trpcClient = createCaller({});

    const activeHackathon = await getCachedActiveHackathon();

    const params = await searchParams;
    const initialEventType = params.initialEventType;
    const initialMode = params.mode === 'challenge' ? 'challenge' : 'event';

    const [events, challengeRows] = await Promise.all([
        trpcClient.events.getHackathonCheckInEvents({
            hackathonId: activeHackathon!.id,
        }),
        trpcClient.challenges.getChallenges({
            hackathonId: activeHackathon!.id,
        }),
    ]);

    return (
        <Scan
            initialEventType={initialEventType as EventType}
            initialMode={initialMode}
            events={events}
            challenges={challengeRows}
        />
    );
}
