import { MobileMonthCalendar } from '@/components/calendar/MobileMonthCalendar';
import { CalendarEventType } from '@/components/calendar/types';
import { Provider } from 'jotai';

export default function MobileTestingPage() {
  const events: CalendarEventType[] = [
    {
      id: 1,
      title: 'Initial Planning Meeting',
      description:
        'Discuss overall goals, timeline, and roles for the hackathon.',
      startTime: new Date('2024-11-01T10:00:00'),
      duration: 90,
      color: '#FF5733',
    },
    {
      id: 2,
      title: 'Budget Review',
      description:
        'Finalize budget allocation for venue, catering, prizes, and swag.',
      startTime: new Date('2024-11-02T14:00:00'),
      duration: 60,
      color: '#33A8FF',
    },
    {
      id: 3,
      title: 'Sponsor Outreach',
      description: 'Follow up with potential sponsors and confirm commitments.',
      startTime: new Date('2024-11-04T10:00:00'),
      duration: 120,
      color: '#A833FF',
    },
    {
      id: 4,
      title: 'Volunteer Recruitment',
      description: 'Organize volunteer applications and assign roles.',
      startTime: new Date('2024-11-05T09:00:00'),
      duration: 120,
      color: '#F2A233',
    },
    {
      id: 5,
      title: 'Venue Walkthrough',
      description: 'Inspect the venue and confirm logistics for the event day.',
      startTime: new Date('2024-11-05T10:00:00'),
      duration: 120,
      color: '#33FF57',
    },
    {
      id: 6,
      title: 'Swag Order Finalization',
      description:
        'Confirm designs and quantities for T-shirts, stickers, and goodies.',
      startTime: new Date('2024-11-06T11:00:00'),
      duration: 60,
      color: '#33A8FF',
    },
    {
      id: 7,
      title: 'Social Media Marketing',
      description: 'Plan and schedule social media posts to promote the event.',
      startTime: new Date('2024-11-07T14:00:00'),
      duration: 90,
      color: '#A833FF',
    },
    {
      id: 8,
      title: 'Hackathon Website Update',
      description:
        'Add event schedule, speaker details, and FAQ to the website.',
      startTime: new Date('2024-11-07T15:00:00'),
      duration: 120,
      color: '#33FF57',
    },
    {
      id: 9,
      title: 'Tech Stack Finalization',
      description: 'Confirm tools and technologies participants will use.',
      startTime: new Date('2024-11-08T13:00:00'),
      duration: 60,
      color: '#FFB833',
    },
    {
      id: 10,
      title: 'Participant Registration Review',
      description:
        'Verify participant information and send confirmation emails.',
      startTime: new Date('2024-11-10T10:00:00'),
      duration: 90,
      color: '#33A8FF',
    },
    {
      id: 11,
      title: 'Catering Menu Finalization',
      description: 'Confirm menu items and meal times with the caterer.',
      startTime: new Date('2024-11-12T11:00:00'),
      duration: 45,
      color: '#FF5733',
    },
    {
      id: 12,
      title: 'Emergency Plan Discussion',
      description:
        'Plan contingencies for power outages, technical issues, etc.',
      startTime: new Date('2024-11-12T12:00:00'),
      duration: 90,
      color: '#F2A233',
    },
    {
      id: 13,
      title: 'Judge Recruitment',
      description: 'Confirm judges and schedule for presentations.',
      startTime: new Date('2024-11-13T10:00:00'),
      duration: 90,
      color: '#A833FF',
    },
    {
      id: 14,
      title: 'Mentor Outreach',
      description:
        'Reach out to mentors and confirm availability during the event.',
      startTime: new Date('2024-11-13T11:00:00'),
      duration: 60,
      color: '#33FF57',
    },
    {
      id: 15,
      title: 'Hardware/Software Preparation',
      description:
        'Test and prepare hardware/software resources for participants.',
      startTime: new Date('2024-11-15T13:00:00'),
      duration: 120,
      color: '#FFB833',
    },
    {
      id: 16,
      title: 'Sponsor Asset Collection',
      description: 'Collect sponsor banners, logos, and promotional materials.',
      startTime: new Date('2024-11-17T14:00:00'),
      duration: 60,
      color: '#FF5733',
    },
    {
      id: 17,
      title: 'Day-of-Event Schedule Draft',
      description: 'Draft the detailed event-day schedule with buffer times.',
      startTime: new Date('2024-11-18T10:00:00'),
      duration: 120,
      color: '#F2A233',
    },
    {
      id: 18,
      title: 'Swag Delivery Confirmation',
      description: 'Verify delivery dates for swag and materials.',
      startTime: new Date('2024-11-19T11:00:00'),
      duration: 60,
      color: '#33A8FF',
    },
    {
      id: 19,
      title: 'Final Checklist Review',
      description: 'Go through the checklist to ensure everything is on track.',
      startTime: new Date('2024-11-20T15:00:00'),
      duration: 120,
      color: '#FF5733',
    },
    {
      id: 20,
      title: 'Team Communication Meeting',
      description: 'Sync with all organizers to ensure alignment.',
      startTime: new Date('2024-11-20T16:00:00'),
      duration: 90,
      color: '#A833FF',
    },
  ];

  return (
    <Provider>
      {' '}
      <MobileMonthCalendar events={events}></MobileMonthCalendar>
    </Provider>
  );
}
