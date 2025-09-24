import { createCaller } from '@/server/appRouter';
import { ClientCalendarPage } from './ClientCalendarPage';
import { CalendarEvent } from '@/server/routers/eventsRouter';

export default async function CalendarPage() {
    const trpcClient = createCaller({});

    const hackathon = await trpcClient.hackathons.getActiveHackathon();
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
