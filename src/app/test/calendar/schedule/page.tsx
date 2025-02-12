'use client';
import { DaySchedule } from '@/components/calendar/DaySchedule/DaySchedule';
import { DayjsifyEvents } from '@/components/calendar/MonthCalendarShared';
import { CalendarEvent } from '@/server/routers/eventsRouter';

import dayjs from 'dayjs';
import { useMemo } from 'react';

export default function SchedulePage() {
    const _events: CalendarEvent[] = [
        {
            id: 1,
            checkedIn: true,
            hasLongDescription: false,
            startDate: new Date('2025-02-14T09:00:00'),
            endDate: new Date('2025-02-14T10:00:00'),
            hackathonId: 101,
            title: 'Opening Ceremony',
            color: '#FF5733',
            location: 'Main Hall',
            description:
                'Kick-off event with introductions and agenda overview.',
        },
        {
            id: 2,
            checkedIn: false,
            hasLongDescription: false,
            startDate: new Date('2025-02-14T10:00:00'),
            endDate: new Date('2025-02-14T11:30:00'),
            hackathonId: 101,
            title: 'Team Formation & Idea Pitching',
            color: '#33FF57',
            location: 'Workshop Room A',
            description:
                'Participants meet and form teams, then pitch initial ideas.',
        },
        {
            id: 3,
            checkedIn: false,
            hasLongDescription: true,
            startDate: new Date('2025-02-14T12:00:00'),
            endDate: new Date('2025-02-14T13:00:00'),
            hackathonId: 101,
            title: 'Lunch Break',
            color: '#FFBD33',
            location: 'Cafeteria',
            description: 'Enjoy a meal and network with fellow hackers.',
        },
        {
            id: 4,
            checkedIn: true,
            hasLongDescription: true,
            startDate: new Date('2025-02-14T13:30:00'),
            endDate: new Date('2025-02-14T15:00:00'),
            hackathonId: 101,
            title: 'Workshop: Intro to Svelte & Firebase',
            color: '#337BFF',
            location: 'Workshop Room B',
            description:
                'A hands-on session covering Svelte basics and Firebase integration.',
        },
        {
            id: 5,
            checkedIn: false,
            hasLongDescription: false,
            startDate: new Date('2025-02-14T15:30:00'),
            endDate: new Date('2025-02-14T16:30:00'),
            hackathonId: 101,
            title: 'Mentor Office Hours',
            color: '#8E44AD',
            location: 'Mentor Lounge',
            description: 'Get help from experienced mentors on your project.',
        },
        {
            id: 6,
            checkedIn: true,
            hasLongDescription: false,
            startDate: new Date('2025-02-14T18:00:00'),
            endDate: new Date('2025-02-14T19:00:00'),
            hackathonId: 101,
            title: 'Dinner & Socializing',
            color: '#E74C3C',
            location: 'Cafeteria',
            description: 'Relax and chat with fellow participants over dinner.',
        },
        {
            id: 7,
            checkedIn: false,
            hasLongDescription: true,
            startDate: new Date('2025-02-14T22:00:00'),
            endDate: new Date('2025-02-14T23:00:00'),
            hackathonId: 101,
            title: 'Midnight Challenge',
            color: '#2C3E50',
            location: 'Main Hall',
            description: 'A fun coding challenge for night owls.',
        },
        {
            id: 8,
            checkedIn: true,
            hasLongDescription: false,
            startDate: new Date('2025-02-14T07:00:00'),
            endDate: new Date('2025-02-14T08:00:00'),
            hackathonId: 101,
            title: 'Breakfast & Morning Check-in',
            color: '#F1C40F',
            location: 'Cafeteria',
            description: 'Fuel up and get ready for the final stretch.',
        },
        {
            id: 9,
            checkedIn: false,
            hasLongDescription: false,
            startDate: new Date('2025-02-14T09:00:00'),
            endDate: new Date('2025-02-14T12:00:00'),
            hackathonId: 101,
            title: 'Hacking Time',
            color: '#3498DB',
            location: 'Hack Room',
            description: 'Last hours to finalize your project.',
        },
        {
            id: 10,
            checkedIn: false,
            hasLongDescription: true,
            startDate: new Date('2025-02-14T12:00:00'),
            endDate: new Date('2025-02-14T13:00:00'),
            hackathonId: 101,
            title: 'Lunch Break',
            color: '#27AE60',
            location: 'Cafeteria',
            description: 'Take a break before project submissions.',
        },
        {
            id: 11,
            checkedIn: true,
            hasLongDescription: true,
            startDate: new Date('2025-02-14T13:30:00'),
            endDate: new Date('2025-02-14T14:00:00'),
            hackathonId: 101,
            title: 'Project Submission Deadline',
            color: '#E67E22',
            location: 'Main Hall',
            description: 'Final deadline for submitting your project.',
        },
        {
            id: 12,
            checkedIn: false,
            hasLongDescription: false,
            startDate: new Date('2025-02-14T14:30:00'),
            endDate: new Date('2025-02-14T16:00:00'),
            hackathonId: 101,
            title: 'Judging & Demos',
            color: '#9B59B6',
            location: 'Demo Hall',
            description: 'Judges review projects and teams present demos.',
        },
        {
            id: 13,
            checkedIn: true,
            hasLongDescription: false,
            startDate: new Date('2025-02-14T16:30:00'),
            endDate: new Date('2025-02-14T17:00:00'),
            hackathonId: 101,
            title: 'Closing Ceremony & Awards',
            color: '#D35400',
            location: 'Main Hall',
            description: 'Winners announced and closing remarks.',
        },
    ];

    const events = useMemo(() => DayjsifyEvents(_events), [_events]);

    return (
        <DaySchedule
            events={events}
            days={1}
            startDate={dayjs(new Date(2025, 1, 14))}
            minColumnWidth={300}
        ></DaySchedule>
    );
}
