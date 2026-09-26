import { createCaller } from '@/server/appRouter';
import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import { Suspense } from 'react';
import { ClientCalendarPage } from './ClientCalendarPage';

export default function CalendarPage() {
    return (
        <Suspense fallback={null}>
            <CalendarContent />
        </Suspense>
    );
}

async function CalendarContent() {
    const trpcClient = createCaller({});

    const hackathon = await getCachedActiveHackathon();
    const ssrEvents = await trpcClient.events.getEvents({
        hackathonId: hackathon.id,
    });

    return <ClientCalendarPage events={ssrEvents} />;
}
