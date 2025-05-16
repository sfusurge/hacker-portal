import { createCaller } from '@/server/appRouter';
import { ClientCalendarPage } from './ClientCalendarPage';
import { CalendarEvent } from '@/server/routers/eventsRouter';

export default async function CalendarPage() {
    const trpcClient = createCaller({});

    const hackathon = await trpcClient.hackathons.getActiveHackathon();

    const ssrEvents = await trpcClient.events.getEvents({
        hackathonId: hackathon.id,
    });

    const _ssrEvents: CalendarEvent[] = [
        {
            id: 1,
            checkedIn: false,
            hasLongDescription: false,
            startDate: new Date('2025-05-17T09:00:00'),
            endDate: new Date('2025-05-17T11:00:00'),
            hackathonId: 1,
            title: 'Check-In & Breakfast',
            color: '#FFB703',
            location: 'Main Hall',
            description:
                'Check in, grab your badge, and enjoy a light breakfast.',
            checkInTime: '09:00',
        },
        {
            id: 2,
            checkedIn: false,
            hasLongDescription: true,
            startDate: new Date('2025-05-17T11:00:00'),
            endDate: new Date('2025-05-17T12:00:00'),
            hackathonId: 1,
            title: 'Opening Ceremony',
            color: '#023047',
            location: 'Auditorium',
            description:
                'Kick off the hackathon with welcome speeches, sponsor intros, and logistics info.',
            checkInTime: '11:00',
        },
        {
            id: 3,
            checkedIn: false,
            hasLongDescription: false,
            startDate: new Date('2025-05-17T12:00:00'),
            endDate: new Date('2025-05-17T12:30:00'),
            hackathonId: 1,
            title: 'Team Formation',
            color: '#219EBC',
            location: 'Collab Lounge',
            description: 'Meet new people and form teams.',
        },
        {
            id: 4,
            checkedIn: false,
            hasLongDescription: false,
            startDate: new Date('2025-05-17T13:00:00'),
            endDate: new Date('2025-05-18T13:00:00'),
            hackathonId: 1,
            title: 'Hacking Begins',
            color: '#8ECAE6',
            location: 'Hack Zones',
            description: 'Start building! 24 hours of hacking.',
        },
        {
            id: 5,
            checkedIn: false,
            hasLongDescription: false,
            startDate: new Date('2025-05-17T18:00:00'),
            endDate: new Date('2025-05-17T19:00:00'),
            hackathonId: 1,
            title: 'Dinner',
            color: '#FB8500',
            location: 'Food Court',
            description: 'Dinner is served for all participants.',
        },
        {
            id: 6,
            checkedIn: false,
            hasLongDescription: false,
            startDate: new Date('2025-05-18T09:00:00'),
            endDate: new Date('2025-05-18T10:00:00'),
            hackathonId: 1,
            title: 'Breakfast',
            color: '#FFB703',
            location: 'Main Hall',
            description: 'Morning breakfast to fuel the final stretch.',
        },
        {
            id: 7,
            checkedIn: false,
            hasLongDescription: true,
            startDate: new Date('2025-05-18T13:00:00'),
            endDate: new Date('2025-05-18T14:30:00'),
            hackathonId: 1,
            title: 'Project Submissions & Judging',
            color: '#219EBC',
            location: 'Submission Portal / Auditorium',
            description:
                'Submit your project and prepare to present to the judges.',
        },
        {
            id: 8,
            checkedIn: false,
            hasLongDescription: false,
            startDate: new Date('2025-05-18T15:00:00'),
            endDate: new Date('2025-05-18T16:00:00'),
            hackathonId: 1,
            title: 'Closing Ceremony & Awards',
            color: '#023047',
            location: 'Auditorium',
            description: 'Celebrate the winners and wrap up the hackathon.',
        },
    ];

    return (
        <ClientCalendarPage
            events={ssrEvents}
            hackathon={hackathon}
        ></ClientCalendarPage>
    );
}
