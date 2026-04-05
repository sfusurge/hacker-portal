import { createCaller } from '@/server/appRouter';
import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import { ClientCalendarPage } from './ClientCalendarPage';

export default async function CalendarPage() {
    const trpcClient = createCaller({});

    const hackathon = await getCachedActiveHackathon();
    const ssrEvents = await trpcClient.events.getEvents({
        hackathonId: hackathon.id,
    });

    return (
        <ClientCalendarPage
            events={ssrEvents}
            hackathon={hackathon}
        ></ClientCalendarPage>
    );
}
