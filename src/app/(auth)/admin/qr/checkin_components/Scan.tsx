'use client';

import { Button } from '@/components/ui/button';
import { EVENT_TYPES, EventType } from '@/db/schema/events';
import { UsersRouter } from '@/server/routers/usersRouter';
import { trpc } from '@/trpc/client';
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    QrCodeIcon,
    TrophyIcon,
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

type ChallengeOption = {
    id: number;
    hackathonId: number;
    title: string;
    points: number;
    maxCompletions: number;
    variablePoints: boolean;
};

interface ScanProps {
    events: {
        id: number;
        hackathonId: number;
        title: string;
        eventType: EventType;
        startDate: string;
        endDate: string;
        points: number;
        variablePoints: boolean;
    }[];
    challenges: ChallengeOption[];
    initialEventType?: EventType;
    initialMode?: 'event' | 'challenge';
}

type GetUserByIdOutput = inferProcedureOutput<UsersRouter['getUserById']>;

export default function Scan({
    events,
    challenges,
    initialEventType,
    initialMode = 'event',
}: ScanProps) {
    const [mode, setMode] = useState<'event' | 'challenge'>(initialMode);

    const initialEventId = useMemo(() => {
        return (
            events.find((event) => event.eventType === initialEventType)?.id ??
            events[0]?.id
        );
    }, [events, initialEventType]);

    const initialEventCount = useMemo(() => {
        if (initialMode === 'challenge') {
            return challenges.length;
        }
        return events.filter((event) => event.eventType === initialEventType)
            .length;
    }, [events, initialEventType, initialMode, challenges.length]);

    const [eventId, setEventId] = useState<number | undefined>(
        initialMode === 'challenge' ? challenges[0]?.id : initialEventId
    );
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
        () =>
            mode === 'event' && eventType === EventType.MEAL && openSelectEvent,
        [eventType, openSelectEvent, mode]
    );

    const isWorkshopsOpen = useMemo(
        () =>
            mode === 'event' &&
            eventType === EventType.WORKSHOP &&
            openSelectEvent,
        [eventType, openSelectEvent, mode]
    );

    const isOtherEventsOpen = useMemo(
        () =>
            mode === 'event' &&
            eventType === EventType.EVENT &&
            openSelectEvent,
        [openSelectEvent, eventType, mode]
    );

    const isChallengesOpen = useMemo(
        () => mode === 'challenge' && openSelectEvent,
        [openSelectEvent, mode]
    );

    const workshopEvents = useMemo(() => {
        return groupEventsByDate(
            events.filter((event) => event.eventType === EventType.WORKSHOP)
        );
    }, [events]);

    const mealEvents = useMemo(() => {
        return groupEventsByDate(
            events.filter((event) => event.eventType === EventType.MEAL)
        );
    }, [events]);

    const otherEvents = useMemo(() => {
        return groupEventsByDate(
            events.filter((event) => event.eventType === EventType.EVENT)
        );
    }, [events]);

    const challengeGroups = useMemo(() => {
        return [
            {
                date: 'Challenges',
                events: challenges.map((c) => ({
                    id: c.id,
                    title: c.title,
                    startDate: dayjs(),
                    endDate: dayjs(),
                })),
            },
        ];
    }, [challenges]);

    const selectedEvent = events.find((e) => e.id === eventId);
    const selectedChallenge = challenges.find((c) => c.id === eventId);

    const currentEventTitle = useMemo(() => {
        if (mode === 'challenge') {
            return selectedChallenge?.title ?? 'Select challenge';
        }
        return selectedEvent?.title ?? '';
    }, [mode, selectedChallenge, selectedEvent]);

    const openManualCheckin = () => {
        setManualCheckIn(true);
    };

    const closeManualCheckin = () => {
        setManualCheckIn(false);
    };

    const handleEventTypeChange = (newEventType: string) => {
        if (newEventType === 'challenge') {
            setMode('challenge');
            setEventId(challenges[0]?.id);
            setOpenSelectEvent(challenges.length > 1);
            return;
        }
        setMode('event');
        setEventType(newEventType as EventType);
        const first = events.find((e) => e.eventType === newEventType);
        setEventId(first?.id);
        setOpenSelectEvent(
            events.filter((e) => e.eventType === newEventType).length > 1
        );
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
                setEventId(
                    mode === 'challenge' ? challenges[0]?.id : initialEventId
                );
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

    const handleEventClick = (id: number) => {
        setEventId(id);
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

    const dropdownValue = mode === 'challenge' ? 'challenge' : eventType;

    return (
        <div className="no-scrollable flex min-h-screen flex-col items-center justify-between bg-neutral-900">
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
                                value={dropdownValue}
                                onValueChange={handleEventTypeChange}
                            >
                                {EVENT_TYPES.map((type) => {
                                    return (
                                        <DropdownMenuRadioItem
                                            key={type}
                                            value={type}
                                            className="gap-2"
                                        >
                                            {iconFromEventType(type)}
                                            <span>{type} Check-in</span>
                                        </DropdownMenuRadioItem>
                                    );
                                })}
                                <DropdownMenuRadioItem
                                    value="challenge"
                                    className="gap-2"
                                >
                                    <TrophyIcon className="size-6" />
                                    <span>Challenge Check-in</span>
                                </DropdownMenuRadioItem>
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
                eventId={mode === 'event' ? (eventId ?? 0) : 0}
                challengeId={mode === 'challenge' ? eventId : undefined}
                hackathonId={
                    mode === 'challenge'
                        ? (selectedChallenge?.hackathonId ??
                          challenges[0]?.hackathonId ??
                          0)
                        : (selectedEvent?.hackathonId ?? 0)
                }
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
                variablePoints={
                    mode === 'challenge'
                        ? (selectedChallenge?.variablePoints ?? false)
                        : (selectedEvent?.variablePoints ?? false)
                }
                maxPoints={
                    mode === 'challenge'
                        ? (selectedChallenge?.points ?? 1)
                        : (selectedEvent?.points ?? 1)
                }
                pointsPerCompletion={
                    mode === 'challenge'
                        ? (selectedChallenge?.points ?? 1)
                        : (selectedEvent?.points ?? 1)
                }
                maxCompletions={
                    mode === 'challenge'
                        ? (selectedChallenge?.maxCompletions ?? 1)
                        : 1
                }
            />

            <SelectEvent
                show={isOtherEventsOpen}
                onClose={closeSelect}
                groupedEvents={otherEvents}
                onEventClick={handleEventClick}
            />

            <SelectEvent
                show={isChallengesOpen}
                onClose={closeSelect}
                groupedEvents={challengeGroups}
                onEventClick={handleEventClick}
                title="Select Challenge"
                description="What challenge are you checking in for?"
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
