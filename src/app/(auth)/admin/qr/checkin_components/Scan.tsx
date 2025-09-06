'use client';

import { Button } from '@/components/ui/button';
import { EVENT_TYPES, EventType } from '@/db/schema/events';
import { UsersRouter } from '@/server/routers/usersRouter';
import { trpc } from '@/trpc/client';
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    QrCodeIcon,
} from '@heroicons/react/24/solid';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { inferProcedureOutput } from '@trpc/server';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import ManualCheckIn from './ManualCheckInPopUp';
import UserNotFound from './UserNotFound';
import dayjs from 'dayjs';
import SelectMeal from './SelectMeal';
import SelectWorkshop from './SelectWorkshop';
import CheckinTicket from './CheckinTicket';
import SelectEvent from './SelectEvents';
import Link from 'next/link';
import { iconFromEventType } from '@/utils/iconFromEventType';
import React from 'react';

interface ScanProps {
    events: {
        id: number;
        title: string;
        eventType: EventType;
        startDate: string;
        endDate: string;
    }[];
    initialEventType?: EventType;
}

type GetUserByIdOutput = inferProcedureOutput<UsersRouter['getUserById']>;

export default function Scan({ events, initialEventType }: ScanProps) {
    const initialEventId = useMemo(() => {
        return (
            events.find((event) => event.eventType === initialEventType)?.id ??
            // else use first event
            events[0]?.id
        );
    }, [events, initialEventType]);

    const initialEventCount = useMemo(() => {
        return events.filter((event) => event.eventType === initialEventType)
            .length;
    }, [events, initialEventType]);

    const [eventId, setEventId] = useState<number | undefined>(initialEventId);
    const [eventType, setEventType] = useState<EventType>(
        initialEventType ?? EventType.EVENT
    );
    const [hacker, setHacker] = useState<GetUserByIdOutput | undefined>();
    const [manualCheckIn, setManualCheckIn] = useState(false);
    const [invalidUserId, setInvalidUserId] = useState<string>('');

    const [openSelectEvent, setOpenSelectEvent] = useState(
        initialEventCount > 1
    );

    const isMealsOpen = useMemo(
        () => eventType === EventType.MEAL && openSelectEvent,
        [eventType, openSelectEvent]
    );

    const isWorkshopsOpen = useMemo(
        () => eventType === EventType.WORKSHOP && openSelectEvent,
        [eventType, openSelectEvent]
    );

    const isOtherEventsOpen = useMemo(
        () => eventType === EventType.EVENT && openSelectEvent,
        [openSelectEvent, eventType]
    );

    const workshopEvents = useMemo(() => {
        return groupEventsByDate(
            events.filter((event) => event.eventType === EventType.WORKSHOP)
        );
    }, [events]);

    const mealEvents = useMemo(() => {
        const meals = events.filter(
            (event) => event.eventType === EventType.MEAL
        );

        return groupEventsByDate(meals);
    }, [events]);

    const otherEvents = useMemo(() => {
        const others = events.filter(
            (event) => event.eventType === EventType.EVENT
        );

        return groupEventsByDate(others);
    }, [events]);

    const currentEventTitle = useMemo(() => {
        return eventId
            ? events.find((event) => event.id === eventId)?.title
            : '';
    }, [eventId, events]);

    const openManualCheckin = () => {
        setManualCheckIn(true);
    };

    const closeManualCheckin = () => {
        setManualCheckIn(false);
    };

    const handleEventTypeChange = (newEventType: string) => {
        setEventType(newEventType as EventType);
        setOpenSelectEvent(true);
    };

    const isCheckInPromptOpen = eventId !== undefined && hacker !== undefined;

    const closeCheckInPrompt = () => {
        setHacker(undefined);
        closeSelect();
    };

    const { client } = trpc.useUtils();

    const findHackerById = async (id: string | number) => {
        const user = await client.users.getUserById.query({ userId: id });

        if (user) {
            setHacker(user);
            if (!eventId) {
                setEventId(initialEventId);
            }
        } else {
            setInvalidUserId(`${id}`);
        }
    };

    const handleScan = (barCodes: IDetectedBarcode[]) => {
        if (barCodes[0]?.rawValue) {
            findHackerById(barCodes[0].rawValue);
        }
    };

    const handleEventClick = (eventId: number) => {
        setEventId(eventId);
        setOpenSelectEvent(false);
    };

    const closeSelect = () => {
        setOpenSelectEvent(false);
    };

    const handleCloseAll = () => {
        setInvalidUserId('');
        setManualCheckIn(false);
        closeSelect();
    };

    const isInvalidUser = useMemo(() => invalidUserId !== '', [invalidUserId]);

    React.useEffect(() => {
        const main = document.querySelector('main');
        if (main) main.classList.add('no-scrollable');
        return () => {
            if (main) main.classList.remove('no-scrollable');
        };
    }, []);

    return (
        <div className="no-scrollable flex min-h-screen flex-col items-center justify-between bg-neutral-900">
            {/* HACK */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                }}
                className="relative z-[10] aspect-[3/4] min-h-screen w-full md:max-w-sm"
            >
                <div className="absolute inset-0 overflow-hidden">
                    <Scanner
                        onScan={handleScan}
                        components={{
                            audio: false,
                            torch: false,
                            finder: false,
                        }}
                        styles={{
                            container: { width: '100%', height: '100%' },
                            video: {
                                objectFit: 'cover',
                                width: '100%',
                                height: '100%',
                            },
                        }}
                    />
                </div>

                <Image
                    src="/qrfull.svg"
                    fill
                    alt="QR Finder"
                    className="overflow-hidden object-cover"
                />

                <div className="absolute top-4 left-4">
                    <Link href="/home">
                        <button className="flex flex-row gap-x-2 text-white transition-shadow duration-300 hover:shadow-lg">
                            <ChevronLeftIcon className="size-6" />
                            <p className="">Back</p>
                        </button>
                    </Link>
                </div>

                {/*Shadcn dropdown*/}
                <div className="absolute top-20 left-1/2 z-1000 -translate-x-1/2 transform">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="flexhover:shadow-lg border-neutral-750 items-center justify-center rounded-full border bg-neutral-900/50 pr-0.5 pl-0.5 transition-shadow duration-300 hover:bg-neutral-900 hover:text-white/80">
                                <div className="flex flex-row gap-x-2">
                                    {currentEventTitle}
                                    <ChevronDownIcon className="size-6" />
                                </div>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="border-neutral-750 w-56 bg-neutral-900/80 text-white/80">
                            <DropdownMenuRadioGroup
                                value={eventType}
                                onValueChange={handleEventTypeChange}
                            >
                                {EVENT_TYPES.map((eventType) => {
                                    return (
                                        <DropdownMenuRadioItem
                                            key={eventType}
                                            value={eventType}
                                            className="gap-2"
                                        >
                                            {iconFromEventType(eventType)}
                                            <span>{eventType} Check-in</span>
                                        </DropdownMenuRadioItem>
                                    );
                                })}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 transform">
                    <button
                        onClick={openManualCheckin}
                        className="border-neutral-750 flex min-w-64 flex-row items-center justify-center gap-x-2 rounded-lg border bg-neutral-900/50 pt-2 pr-7 pb-2 pl-7 text-white transition-shadow duration-300 hover:shadow-lg"
                    >
                        <QrCodeIcon className="size-6" />
                        <p className="font-light">Input code manually</p>
                    </button>
                </div>
            </div>

            {/* TODO: refactor all of these pop up into 1 single component */}
            <ManualCheckIn
                show={manualCheckIn}
                onClose={closeManualCheckin}
                toggleCheckInPrompt={async (displayId) =>
                    await findHackerById(displayId)
                }
            />

            <UserNotFound
                show={isInvalidUser}
                userId={invalidUserId}
                closeAll={handleCloseAll}
                backToManual={() => {
                    handleCloseAll();
                    setManualCheckIn(true);
                }}
            />

            <CheckinTicket
                onClose={closeCheckInPrompt}
                eventId={eventId ?? 0}
                currentHacker={
                    hacker ?? {
                        id: 0,
                        email: '',
                        image: null,
                        firstName: '',
                        lastName: '',
                        phoneNumber: null,
                        userRole: '',
                        displayId: '',
                    }
                }
                eventType={eventType}
                open={isCheckInPromptOpen}
            />

            <SelectEvent
                show={isOtherEventsOpen}
                onClose={closeSelect}
                groupedEvents={otherEvents}
                onEventClick={handleEventClick}
            />

            <SelectMeal
                show={isMealsOpen}
                onClose={closeSelect}
                meals={mealEvents}
                onMealClick={handleEventClick}
            />

            <SelectWorkshop
                show={isWorkshopsOpen}
                onClose={closeSelect}
                workshops={workshopEvents}
                onWorkshopClick={handleEventClick}
            />
        </div>
    );
}

function groupEventsByDate(events: ScanProps['events']) {
    const eventsGroupByDate = Object.groupBy(
        events.map((event) => ({
            ...event,
            startDate: dayjs(event.startDate),
            endDate: dayjs(event.endDate),
        })),
        (event) => event.startDate.format('MMM DD YYYY')
    );

    return Object.entries(eventsGroupByDate).map(([date, groupedEvents]) => ({
        date,
        events: groupedEvents ?? [],
    }));
}
function useEffect(arg0: () => () => void, arg1: never[]) {
    throw new Error('Function not implemented.');
}
