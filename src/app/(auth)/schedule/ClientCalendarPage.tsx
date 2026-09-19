'use client';

import { DaySchedule } from '@/components/calendar/DaySchedule/DaySchedule';
import {
    currentYearMonthAtom,
    DayjsifyEvents,
    selectedEventAtom,
} from '@/components/calendar/MonthCalendarShared';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { CalendarEvent } from '@/server/routers/eventsRouter';
import dayjs, { Dayjs } from 'dayjs';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { userInfoAtom } from '../ClientContext';
import {
    editModeAtom,
    EventAdmin,
} from '@/components/calendar/EventAdmin/EventAdmin';
import { PencilIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useWindowSize } from '@/lib/useWindowSize';
import { trpc } from '@/trpc/client';
import { MobileCalendar } from '@/components/calendar/MobileMonthCalendar/MobileCalendar';
import { hasAdminAccess } from '@/lib/auth/roles';
import { AnnouncementsButton } from '@/components/announcements/AnnouncementsButton';
import { cn } from '@/lib/utils';

export function ClientCalendarPage({
    events: _events,
    hackathon,
}: {
    events: CalendarEvent[];
    hackathon: {
        id: number;
        name: string;
        startDate: string;
        endDate: string;
        submissionDeadline: Date;

        version: number;
    };
}) {
    const eventsAtom = useMemo(() => atom(DayjsifyEvents(_events)), [_events]);
    const [events, setEvents] = useAtom(eventsAtom);

    const userInfo = useAtomValue(userInfoAtom);
    const isAdmin = useMemo(
        () => userInfo && hasAdminAccess(userInfo.userRole),
        [userInfo]
    );

    const [{ year, month }, updateYearMonth] = useAtom(currentYearMonthAtom);
    const monthObj = useMemo(
        () => dayjs(new Date(year, month, 1)),
        [year, month]
    );

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true);
    }, []);

    const [width] = useWindowSize();
    const eventStarted = useMemo(() => {
        return (
            dayjs().isAfter(dayjs(hackathon.startDate).startOf('day')) &&
            dayjs().isBefore(hackathon.endDate)
        );
    }, [hackathon]);
    const isMobile = useMemo(() => width <= 768, [width]);

    const [selectedEvent] = useAtom(selectedEventAtom);
    const [editMode, setEditMode] = useAtom(editModeAtom);

    const fetchEvents = trpc.events.getEvents.useQuery(
        { hackathonId: hackathon?.id! },
        { enabled: false }
    );

    const defaultStartDate = useMemo(() => {
        const today = dayjs().startOf('day');

        const firstDay = dayjs(hackathon.startDate);
        const lastDay = dayjs(hackathon.endDate).endOf('day');

        let minDate = dayjs(new Date(2099, 1, 1));
        let updated = false;
        for (const e of events) {
            if (e.startTime.isAfter(today) && e.startTime.isBefore(minDate)) {
                minDate = e.startTime;
                updated = true;
            }
        }
        if (!updated) {
            minDate = today;
        }

        if (today.isBefore(firstDay)) {
            return minDate.startOf('day');
        }

        if (today.isBefore(lastDay)) {
            return firstDay.startOf('day');
        }

        // after event, just display today
        return today;
    }, [events, hackathon.endDate, hackathon.startDate]);

    const [desktopStartDate, setDesktopStartDate] = useState<Dayjs>();
    const scheduleStartDate = desktopStartDate ?? defaultStartDate;
    const scheduleDays = eventStarted ? 2 : 7;

    useEffect(() => {
        if (isMobile) {
            return;
        }

        updateYearMonth('set', {
            year: scheduleStartDate.year(),
            month: scheduleStartDate.month(),
        });
    }, [isMobile, scheduleStartDate, updateYearMonth]);

    function setDesktopScheduleDate(date: Dayjs) {
        const nextDate = date.startOf('day');
        setDesktopStartDate(nextDate);
        updateYearMonth('set', {
            year: nextDate.year(),
            month: nextDate.month(),
        });
    }

    function handleDesktopDateSelect(date: Date | undefined) {
        if (!date) {
            return;
        }

        setDesktopScheduleDate(dayjs(date));
    }

    function handleDesktopMonthChange(date: Date) {
        setDesktopScheduleDate(dayjs(date).startOf('month'));
    }

    useEffect(() => {
        async function updateEvents() {
            if (!hackathon || !hackathon.id) {
                return;
            }
            const res = await fetchEvents.refetch();
            setEvents(
                DayjsifyEvents(
                    res.data?.map((item) => {
                        return {
                            ...item,
                            startDate: new Date(item.startDate),
                            endDate: new Date(item.endDate),
                        };
                    }) ?? []
                )
            );
        }
        const interval = setInterval(updateEvents, 30000); // 5 mins
        return () => {
            clearInterval(interval);
        };
    }, [hackathon]);

    return (
        <>
            {isAdmin && <EventAdmin eventsAtom={eventsAtom} />}

            <div
                className="flex h-full min-h-0 flex-col"
                style={{ height: '100%', opacity: loaded ? 1 : 0 }}
            >
                {isMobile ? (
                    <>
                        <ScheduleHeader
                            eyebrow={`${hackathon.name} Schedule`}
                            monthLabel={monthObj.format('MMMM YYYY')}
                            isAdmin={Boolean(isAdmin)}
                            hasSelectedEvent={Boolean(selectedEvent?.event)}
                            onToggleEditMode={() => {
                                setEditMode(!editMode);
                            }}
                            showActions={false}
                            className="px-3 pt-3 pb-2"
                        />
                        {isAdmin && (
                            <ScheduleActions
                                isAdmin={Boolean(isAdmin)}
                                hasSelectedEvent={Boolean(selectedEvent?.event)}
                                onToggleEditMode={() => {
                                    setEditMode(!editMode);
                                }}
                                className="justify-end px-3 pb-2"
                            />
                        )}

                        <div className="min-h-0 flex-1">
                            <MobileCalendar events={events} />
                        </div>
                    </>
                ) : (
                    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_18rem] gap-4">
                        <div className="flex min-h-0 flex-col">
                            <ScheduleHeader
                                eyebrow={`${hackathon.name} Schedule`}
                                monthLabel={scheduleStartDate.format(
                                    'MMMM YYYY'
                                )}
                                isAdmin={Boolean(isAdmin)}
                                hasSelectedEvent={Boolean(selectedEvent?.event)}
                                onToggleEditMode={() => {
                                    setEditMode(!editMode);
                                }}
                                className="pb-3"
                            />
                            <div className="min-h-0 flex-1">
                                <DaySchedule
                                    days={scheduleDays}
                                    startDate={scheduleStartDate}
                                    events={events}
                                    minColumnWidth={200}
                                />
                            </div>
                        </div>

                        <aside className="flex min-h-0 flex-col gap-4">
                            <Card className="flex-none overflow-hidden bg-neutral-900">
                                <Calendar
                                    mode="single"
                                    month={monthObj.toDate()}
                                    selected={scheduleStartDate.toDate()}
                                    onSelect={handleDesktopDateSelect}
                                    onMonthChange={handleDesktopMonthChange}
                                    className="w-full p-4"
                                />
                            </Card>
                        </aside>
                    </div>
                )}
            </div>
        </>
    );
}

function ScheduleHeader({
    eyebrow,
    monthLabel,
    isAdmin,
    hasSelectedEvent,
    onToggleEditMode,
    showActions = true,
    className,
}: {
    eyebrow: string;
    monthLabel: string;
    isAdmin: boolean;
    hasSelectedEvent: boolean;
    onToggleEditMode: () => void;
    showActions?: boolean;
    className?: string;
}) {
    return (
        <div className={cn('flex items-center gap-3', className)}>
            <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-sans text-sm leading-none font-normal text-[var(--text-secondary)]">
                    {eyebrow}
                </span>
                <h1 className="leading-tighter truncate font-sans text-2xl font-semibold text-[var(--text-regular)]">
                    {monthLabel}
                </h1>
            </div>
            {showActions && (
                <ScheduleActions
                    isAdmin={isAdmin}
                    hasSelectedEvent={hasSelectedEvent}
                    onToggleEditMode={onToggleEditMode}
                    className="ml-auto"
                />
            )}
        </div>
    );
}

function ScheduleActions({
    isAdmin,
    hasSelectedEvent,
    onToggleEditMode,
    className,
}: {
    isAdmin: boolean;
    hasSelectedEvent: boolean;
    onToggleEditMode: () => void;
    className?: string;
}) {
    return (
        <div className={cn('flex shrink-0 items-center gap-2', className)}>
            {isAdmin && (
                <EventAdminButton
                    hasSelectedEvent={hasSelectedEvent}
                    onToggleEditMode={onToggleEditMode}
                />
            )}
            <AnnouncementsButton className="shrink-0" />
        </div>
    );
}

function EventAdminButton({
    hasSelectedEvent,
    onToggleEditMode,
}: {
    hasSelectedEvent: boolean;
    onToggleEditMode: () => void;
}) {
    return (
        <Button
            type="button"
            onClick={onToggleEditMode}
            size="compact"
            variant="brand"
            hierarchy="primary"
            className="[&>span]:py-[7px]"
        >
            {hasSelectedEvent ? (
                <span>
                    <PencilIcon
                        style={{
                            display: 'inline-block',
                            width: '16px',
                        }}
                    />
                    Edit Event
                </span>
            ) : (
                <span>
                    <PlusIcon
                        style={{
                            display: 'inline-block',
                            width: '16px',
                        }}
                    />
                    Add Event
                </span>
            )}
        </Button>
    );
}
