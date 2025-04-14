'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { LongDescriptionModal } from '@/components/calendar/EventLongDescription/EventLongDescription';
import {
    selectedEventAtom,
    DayjsifyEvents,
    InternalCalendarEventType,
} from '@/components/calendar/MonthCalendarShared';
import { useSetAtom } from 'jotai';
import {
    Card,
    CardHeader,
    CardHeaderTitle,
    CardHeaderDescription,
    CardContent,
    CardFooter,
    CardHeaderColumn,
} from '@/components/ui/card';

export default function EventsCard({ events }: { events: any[] }) {
    const [selectedEvent, setSelectedEvent] =
        useState<InternalCalendarEventType | null>(null);
    const [showModal, setShowModal] = useState(false);
    const setGlobalSelectedEvent = useSetAtom(selectedEventAtom);

    // Filter to show only upcoming
    const upcomingEvents = events
        ?.filter((event) => {
            return new Date(event.startDate) > new Date();
        })
        .sort((a, b) => {
            return (
                new Date(a.startDate).getTime() -
                new Date(b.startDate).getTime()
            );
        });

    const handleEventClick = (event: any) => {
        const convertedEvents = DayjsifyEvents([event]);
        const convertedEvent = convertedEvents[0];

        setSelectedEvent(convertedEvent);
        setShowModal(true);
        setGlobalSelectedEvent({
            event: convertedEvent,
            element: undefined,
        });
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderDescription>Your Schedule</CardHeaderDescription>
                    <CardHeaderTitle>Upcoming Events</CardHeaderTitle>
                </CardHeaderColumn>
                <Link href="/schedule" className="hidden md:block">
                    <Button size="cozy" variant="default" hierarchy="primary">
                        View event schedule
                    </Button>
                </Link>
            </CardHeader>
            <CardContent
                className={
                    upcomingEvents && upcomingEvents.length > 0
                        ? 'max-h-[400px] gap-1 space-y-1 overflow-y-auto'
                        : ''
                }
            >
                {upcomingEvents && upcomingEvents.length > 0 ? (
                    <>
                        {upcomingEvents.map((event) => (
                            <div
                                key={event.id}
                                className="hover:bg-neutral-750/60 flex cursor-pointer items-center gap-4 rounded-lg p-2"
                                onClick={() => handleEventClick(event)}
                            >
                                <div className="flex min-w-12 flex-col items-center justify-start overflow-hidden rounded-lg bg-neutral-800 pt-2 text-center font-mono text-white">
                                    <span className="pb-1 text-xs font-medium uppercase">
                                        {format(event.startDate, 'MMM')}
                                    </span>
                                    <span className="w-full bg-neutral-950 px-3 py-1 text-lg font-bold">
                                        {format(event.startDate, 'd')}
                                    </span>
                                </div>
                                <div className="flex h-full flex-col justify-center gap-2">
                                    <h3 className="leading-tight font-semibold text-white">
                                        {event.title}
                                    </h3>
                                    <p className="text-sm text-white/60">
                                        {format(
                                            event.startDate,
                                            'MMMM d, h:mm a'
                                        )}{' '}
                                        · {event.location}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-6 md:px-10 md:py-8 md:text-center">
                        <Image
                            src="/dashboard/moon-otters.webp"
                            width={1444}
                            height={1276}
                            alt="A bunch of otters on the moon"
                            className="pointer-events-none mx-auto h-auto w-full max-w-56"
                        />
                        <div className="flex flex-col justify-center gap-2 md:items-center">
                            <h3 className="text-lg font-semibold text-white">
                                There&apos;s nothing here 📋
                            </h3>
                            <p className="text-pretty text-white/60 md:max-w-7/10">
                                We&apos;re currently finalizing our event
                                schedule. You can check back later for more
                                details.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="md:hidden">
                <Link href="/schedule">
                    <Button
                        size="cozy"
                        variant="default"
                        hierarchy="primary"
                        className="w-full"
                    >
                        View event schedule
                    </Button>
                </Link>
            </CardFooter>

            <AnimatePresence>
                {showModal && selectedEvent && (
                    <LongDescriptionModal
                        event={selectedEvent}
                        onClose={() => {
                            setShowModal(false);
                            setSelectedEvent(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </Card>
    );
}
