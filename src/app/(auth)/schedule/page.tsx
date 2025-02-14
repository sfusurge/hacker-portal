import { createCaller } from '@/server/appRouter';
import { ClientCalendarPage } from './ClientCalendarPage';

export default async function CalendarPage() {
    const trpcClient = createCaller({});
    const ssrEvents = await trpcClient.events.getEvents({ hackathonId: 1 });

    return <ClientCalendarPage events={ssrEvents}></ClientCalendarPage>;
}
