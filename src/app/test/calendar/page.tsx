'use client';

import { MonthCalendar } from '@/components/calendar/MonthCalendar/MonthCalendar';
import { LinearTimeline } from '@/components/calendar/LinearTimeLine/LinearTimeline';
import { Provider, useAtom, useSetAtom } from 'jotai';
import { useMemo } from 'react';
import {
    currentYearMonthAtom,
    DayjsifyEvents,
} from '@/components/calendar/MonthCalendarShared';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import { CalendarEvent } from '@/server/routers/eventsRouter';

export default function Calendar() {
    const _events: CalendarEvent[] = [
        {
            id: 1,
            checkedIn: true,
            hasLongDescription: false,
            startDate: new Date('2025-02-03T10:00:00'),
            endDate: new Date('2025-02-03T12:00:00'),
            hackathonId: 101,
            title: 'Opening Ceremony',
            color: '#ff5733',
            location: 'Main Hall',
            description: 'Kickoff event with keynote speakers.',
        },
        {
            id: 2,
            checkedIn: false,
            hasLongDescription: true,
            startDate: new Date('2025-02-04T14:00:00'),
            endDate: new Date('2025-02-04T16:00:00'),
            hackathonId: 101,
            title: 'Workshop: Intro to Svelte',
            color: '#33ff57',
            location: 'Room 202',
            description:
                'Learn the basics of Svelte for rapid frontend development.',
        },
        {
            id: 3,
            checkedIn: true,
            hasLongDescription: false,
            startDate: new Date('2025-02-05T09:30:00'),
            endDate: new Date('2025-02-05T10:30:00'),
            hackathonId: 101,
            title: 'Team Formation Session',
            color: '#5733ff',
            location: 'Networking Lounge',
            description: 'Find teammates and form a team for the hackathon.',
        },
        {
            id: 4,
            checkedIn: false,
            hasLongDescription: false,
            startDate: new Date('2025-02-06T13:00:00'),
            endDate: new Date('2025-02-06T14:30:00'),
            hackathonId: 101,
            title: 'Fireside Chat with Judges',
            color: '#ff33a8',
            location: 'Main Hall',
            description: 'Informal discussion with hackathon judges.',
        },
        {
            id: 5,
            checkedIn: true,
            hasLongDescription: true,
            startDate: new Date('2025-02-07T15:00:00'),
            endDate: new Date('2025-02-07T16:30:00'),
            hackathonId: 101,
            title: 'Workshop: Firebase for Beginners',
            color: '#ffa833',
            location: 'Room 101',
            description: 'Learn how to integrate Firebase into your project.',
        },
        {
            id: 6,
            checkedIn: false,
            hasLongDescription: false,
            startDate: new Date('2025-02-08T11:00:00'),
            endDate: new Date('2025-02-08T12:00:00'),
            hackathonId: 101,
            title: 'Tech Talk: AI in Web Development',
            color: '#33a8ff',
            location: 'Auditorium',
            description: 'Discover how AI is transforming web development.',
        },
        {
            id: 7,
            checkedIn: true,
            hasLongDescription: false,
            startDate: new Date('2025-02-09T18:00:00'),
            endDate: new Date('2025-02-09T19:30:00'),
            hackathonId: 101,
            title: 'Mid-Hackathon Check-In',
            color: '#a833ff',
            location: 'Online',
            description: 'Get feedback on your project progress.',
        },
        {
            id: 8,
            checkedIn: false,
            hasLongDescription: true,
            startDate: new Date('2025-02-10T20:00:00'),
            endDate: new Date('2025-02-10T22:00:00'),
            hackathonId: 101,
            title: 'Pitch Practice Session',
            color: '#33ffa8',
            location: 'Room 303',
            description: 'Practice your pitch with mentors.',
        },
        {
            id: 9,
            checkedIn: true,
            hasLongDescription: false,
            startDate: new Date('2025-02-11T09:00:00'),
            endDate: new Date('2025-02-11T11:00:00'),
            hackathonId: 101,
            title: 'Project Submission Deadline',
            color: '#ff3333',
            location: 'Online Submission Portal',
            description: 'Submit your final project before the deadline.',
        },
        {
            id: 10,
            checkedIn: false,
            hasLongDescription: true,
            startDate: new Date('2025-02-12T17:00:00'),
            endDate: new Date('2025-02-12T19:00:00'),
            hackathonId: 101,
            title: 'Closing Ceremony & Awards',
            color: '#33ffcc',
            location: 'Main Hall',
            description: 'Celebrate the winners and wrap up the hackathon.',
        },
        {
            id: 11,
            checkedIn: false,
            hasLongDescription: true,
            startDate: new Date('2025-02-12T17:00:00'),
            endDate: new Date('2025-02-12T19:00:00'),
            hackathonId: 101,
            title: 'Closing Ceremony & Awards',
            color: '#33ffcc',
            location: 'Main Hall',
            description: 'Celebrate the winners and wrap up the hackathon.',
        },
        {
            id: 12,
            checkedIn: false,
            hasLongDescription: true,
            startDate: new Date('2025-02-12T17:00:00'),
            endDate: new Date('2025-02-12T19:00:00'),
            hackathonId: 101,
            title: 'Closing Ceremony & Awards',
            color: '#33ffcc',
            location: 'Main Hall',
            description: 'Celebrate the winners and wrap up the hackathon.',
        },
        {
            id: 13,
            checkedIn: false,
            hasLongDescription: true,
            startDate: new Date('2025-02-12T17:00:00'),
            endDate: new Date('2025-02-12T19:00:00'),
            hackathonId: 101,
            title: 'Closing Ceremony & Awards',
            color: '#33ffcc',
            location: 'Main Hall',
            description: 'Celebrate the winners and wrap up the hackathon.',
        },
        {
            id: 14,
            checkedIn: false,
            hasLongDescription: true,
            startDate: new Date('2025-02-12T17:00:00'),
            endDate: new Date('2025-02-12T19:00:00'),
            hackathonId: 101,
            title: 'Closing Ceremony & Awards',
            color: '#33ffcc',
            location: 'Main Hall',
            description: 'Celebrate the winners and wrap up the hackathon.',
        },
        {
            id: 15,
            checkedIn: false,
            hasLongDescription: true,
            startDate: new Date('2025-02-12T17:00:00'),
            endDate: new Date('2025-02-12T19:00:00'),
            hackathonId: 101,
            title: 'Closing Ceremony & Awards',
            color: '#33ffcc',
            location: 'Main Hall',
            description: 'Celebrate the winners and wrap up the hackathon.',
        },
    ];

    const events = useMemo(() => DayjsifyEvents(_events), [_events]);
    const [{ year, month }, updateMonth] = useAtom(currentYearMonthAtom);
    return (
        // Provider provides context for this page, so that calendar variables is only shared within this page, not truely global.

        <div>
            <h1>Calendar Test page</h1>
            <div className="flex">
                <Button
                    onClick={() => {
                        updateMonth('-1 month');
                    }}
                >
                    Prev
                </Button>
                <Button
                    onClick={() => {
                        updateMonth('set', {
                            year: dayjs().year(),
                            month: dayjs().month(),
                        });
                    }}
                >
                    Current
                </Button>
                <Button
                    onClick={() => {
                        updateMonth('+1 month');
                    }}
                >
                    Next
                </Button>
                <span>
                    Year {year}, Month: {month}
                </span>
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    height: 'min-content',
                }}
            >
                <MonthCalendar events={events}></MonthCalendar>
                {/* 
                    <LinearTimeline
                        events={events}
                        styles={{
                            maxHeight: '600px',
                        }}
                    ></LinearTimeline> */}
            </div>
        </div>
    );
}
