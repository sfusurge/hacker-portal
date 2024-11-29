'use client';

import { CalendarEventType } from '@/components/calendar/types';
import { MonthCalendar } from '@/components/calendar/MonthCalendar';
import { LinearTimeline } from '@/components/calendar/LinearTimeline';

export default function Calendar() {
    const events: CalendarEventType[] = [
        // big chatgpt W
        {
            id: 1,
            title: 'Project Kickoff Meeting',
            description:
                'Initial meeting to discuss project goals and timelines.',
            startTime: new Date('2024-11-04T10:00:00'),
            duration: 60,
            color: '#FF5733',
        },
        {
            id: 2,
            title: 'Team Standup',
            description: 'Daily standup to sync on progress.',
            startTime: new Date('2024-11-04T10:30:00'),
            duration: 15,
            color: '#33FF57',
        },
        {
            id: 3,
            title: 'Design Review',
            description: 'Review designs with the team and gather feedback.',
            startTime: new Date('2024-11-07T14:00:00'),
            duration: 90,
            color: '#5733FF',
        },
        {
            id: 4,
            title: 'Hackathon Workshop',
            description: 'Interactive workshop on React and Firebase.',
            startTime: new Date('2024-11-08T13:00:00'),
            duration: 120,
            color: '#FF33A8',
        },
        {
            id: 5,
            title: 'Client Demo',
            description: 'Present prototype to the client for feedback.',
            startTime: new Date('2024-11-08T14:00:00'),
            duration: 45,
            color: '#33FFF2',
        },
        {
            id: 6,
            title: 'Code Sprint',
            description: 'Focus session to implement key features.',
            startTime: new Date('2024-11-14T09:00:00'),
            duration: 180,
            color: '#F2A233',
        },
        {
            id: 7,
            title: 'Retrospective',
            description: 'Review completed work and discuss improvements.',
            startTime: new Date('2024-11-14T11:00:00'),
            duration: 60,
            color: '#A833FF',
        },
        {
            id: 8,
            title: 'Tech Talk',
            description: 'Presentation on advanced Firebase techniques.',
            startTime: new Date('2024-11-18T15:00:00'),
            duration: 90,
            color: '#FF8C33',
        },
        {
            id: 9,
            title: 'Final Presentation Prep',
            description: 'Prepare slides and rehearse final presentation.',
            startTime: new Date('2024-11-22T10:30:00'),
            duration: 120,
            color: '#33A8FF',
        },
        {
            id: 10,
            title: 'Thanksgiving Team Lunch',
            description: 'Celebrate Thanksgiving with the team.',
            startTime: new Date('2024-11-28T18:00:00'),
            duration: 90,
            color: '#FFB833',
        },
    ];
    return (
        <div>
            <h1>Calendar Test page</h1>
            <MonthCalendar events={events}></MonthCalendar>

            <LinearTimeline
                events={events}
                styles={{
                    maxHeight: '400px',
                }}
            ></LinearTimeline>

            <h2>Make page longer</h2>
            <h2>Make page longer</h2>

            <h2>Make page longer</h2>

            <h2>Make page longer</h2>

            <h2>Make page longer</h2>

            <h2>Make page longer</h2>

            <h2>Make page longer</h2>

            <h2>Make page longer</h2>

            <h2>Make page longer</h2>

            <h2>Make page longer</h2>

            <h2>Make page longer</h2>
        </div>
    );
}
