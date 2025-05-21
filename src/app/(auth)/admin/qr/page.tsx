import { createCaller } from '@/server/appRouter';
import Scan from './checkin_components/Scan';
import { EventType } from '@/db/schema/events';

interface QRScanProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function QRScan({ searchParams }: QRScanProps) {
    const trpcClient = createCaller({});

    const activeHackathon = await trpcClient.hackathons.getActiveHackathon();

    const events = await trpcClient.events.getHackathonCheckInEvents({
        hackathonId: activeHackathon.id,
    });

    const initialEventType = (await searchParams).initialEventType;

    return (
        <Scan
            initialEventType={initialEventType as EventType}
            events={events}
        />
    );
}
