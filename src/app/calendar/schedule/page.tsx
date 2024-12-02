'use client';
import { DaySchedule } from '@/components/calendar/DaySchedule';
import { CalendarEventType } from '@/components/calendar/types';
import dayjs from 'dayjs';

export default function SchedulePage() {
    const events: CalendarEventType[] = [
        {
            id: 1,
            title: 'Opening Ceremony',
            description:
                'Kick-off the hackathon with a welcome speech and event overview.',
            startTime: new Date('2024-12-07T09:00:00'),
            duration: 60,
            color: '#FF5733',
        },
        {
            id: 2,
            title: 'Team Formation & Idea Brainstorming',
            description: 'Form teams and brainstorm project ideas.',
            startTime: new Date('2024-12-07T10:00:00'),
            duration: 120,
            color: '#33A8FF',
        },
        {
            id: 3,
            title: 'Workshop: Intro to AI/ML',
            description:
                'Learn the basics of AI and machine learning for your project.',
            startTime: new Date('2024-12-07T10:30:00'), // Overlaps with team brainstorming
            duration: 90,
            color: '#A833FF',
        },
        {
            id: 4,
            title: 'Lunch Break',
            description:
                'Refuel with a catered lunch and network with other participants.',
            startTime: new Date('2024-12-07T13:00:00'),
            duration: 60,
            color: '#33FF57',
        },
        {
            id: 5,
            title: 'Coding Sprint #1',
            description: 'Begin working on your project with your team.',
            startTime: new Date('2024-12-07T14:00:00'),
            duration: 180,
            color: '#FFB833',
        },
        {
            id: 6,
            title: 'Mentor Office Hours',
            description:
                'Ask mentors for advice and get feedback on your project.',
            startTime: new Date('2024-12-07T15:00:00'), // Overlaps with Coding Sprint #1
            duration: 120,
            color: '#F2A233',
        },
        {
            id: 7,
            title: 'Workshop: UI/UX Design Tips',
            description:
                'Learn essential design principles to make your project stand out.',
            startTime: new Date('2024-12-07T16:00:00'), // Overlaps with Coding Sprint #1 and Mentor Hours
            duration: 90,
            color: '#33A8FF',
        },
        {
            id: 8,
            title: 'Dinner Break',
            description:
                'Enjoy a catered dinner and relax before the evening activities.',
            startTime: new Date('2024-12-07T18:30:00'),
            duration: 60,
            color: '#33FF57',
        },
        {
            id: 9,
            title: 'Lightning Talks',
            description:
                'Short presentations from experts on emerging tech topics.',
            startTime: new Date('2024-12-07T19:00:00'),
            duration: 90,
            color: '#A833FF',
        },
        {
            id: 10,
            title: 'Coding Sprint #2',
            description:
                'Continue coding and refining your project into the night.',
            startTime: new Date('2024-12-07T20:00:00'),
            duration: 240,
            color: '#FF5733',
        },
        {
            id: 11,
            title: 'Breakfast & Check-In',
            description:
                'Start the second day with breakfast and a check-in on progress.',
            startTime: new Date('2024-12-08T08:00:00'),
            duration: 60,
            color: '#FFB833',
        },
        {
            id: 12,
            title: 'Final Coding Sprint',
            description:
                'Finish coding and prepare your project for presentation.',
            startTime: new Date('2024-12-08T09:00:00'),
            duration: 180,
            color: '#A833FF',
        },
        {
            id: 13,
            title: 'Pitch Practice',
            description: 'Rehearse your pitch and get feedback from mentors.',
            startTime: new Date('2024-12-08T10:00:00'), // Overlaps with Final Coding Sprint
            duration: 90,
            color: '#F2A233',
        },
        {
            id: 14,
            title: 'Project Presentations',
            description:
                'Teams present their projects to judges and other participants.',
            startTime: new Date('2024-12-08T13:00:00'),
            duration: 180,
            color: '#FF5733',
        },
        {
            id: 15,
            title: 'Closing Ceremony & Awards',
            description:
                "Celebrate the participants' efforts and announce winners.",
            startTime: new Date('2024-12-08T16:30:00'),
            duration: 90,
            color: '#33FF57',
        },
    ];

    return (
        <DaySchedule
            events={events}
            days={2}
            startDate={dayjs(new Date(2024, 11, 7))}
            minColumnWidth={300}
        ></DaySchedule>
    );
}
