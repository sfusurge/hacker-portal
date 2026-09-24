'use client';

import {
    DaySchedule,
    type ScheduleViewMode,
} from '@/components/calendar/DaySchedule/DaySchedule';
import {
    currentYearMonthAtom,
    DayjsifyEvents,
    editModeAtom,
    selectEventAtom,
} from '@/components/calendar/MonthCalendarShared';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { CalendarEvent } from '@/server/routers/eventsRouter';
import dayjs, { Dayjs } from 'dayjs';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    hackathonAtom,
    hackathonScheduleRangeAtom,
    userInfoAtom,
} from '../ClientContext';
import { EventAdmin } from '@/components/calendar/EventAdmin/EventAdmin';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useWindowSize } from '@/lib/useWindowSize';
import { trpc } from '@/trpc/client';
import { MobileCalendar } from '@/components/calendar/MobileMonthCalendar/MobileCalendar';
import { hasAdminAccess } from '@/lib/auth/roles';
import { AnnouncementsButton } from '@/components/announcements/AnnouncementsButton';
import { cn } from '@/lib/utils';
import { ScheduleEventsCard } from '@/components/calendar/ScheduleEventsCard/ScheduleEventsCard';

export function ClientCalendarPage({
    events: _events,
}: {
    events: CalendarEvent[];
}) {
    const eventsAtom = useMemo(() => atom(DayjsifyEvents(_events)), [_events]);
    const [events, setEvents] = useAtom(eventsAtom);

    const userInfo = useAtomValue(userInfoAtom);
    const hackathon = useAtomValue(hackathonAtom);
    const hackathonRange = useAtomValue(hackathonScheduleRangeAtom);
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
    const isMobile = useMemo(() => width <= 768, [width]);

    const selectEvent = useSetAtom(selectEventAtom);
    const setEditMode = useSetAtom(editModeAtom);

    const fetchEvents = trpc.events.getEvents.useQuery(
        { hackathonId: hackathon?.id! },
        { enabled: false }
    );

    const updateEvents = useCallback(async () => {
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
    }, [fetchEvents, hackathon, setEvents]);

    const defaultStartDate = useMemo(() => {
        const today = dayjs().startOf('day');

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

        if (today.isBefore(hackathonRange.startDate)) {
            return minDate.startOf('day');
        }

        if (today.isBefore(hackathonRange.endDate)) {
            return hackathonRange.startDate;
        }

        // after event, just display today
        return today;
    }, [events, hackathonRange]);

    const [desktopStartDate, setDesktopStartDate] = useState<Dayjs>();
    const [desktopSelectedDate, setDesktopSelectedDate] = useState<Dayjs>();
    const [scheduleViewMode, setScheduleViewMode] =
        useState<ScheduleViewMode>('week');
    const scheduleStartDate = desktopStartDate ?? defaultStartDate;
    const visibleScheduleStartDate =
        scheduleViewMode === 'event'
            ? hackathonRange.startDate
            : scheduleStartDate;
    const visibleScheduleDays =
        scheduleViewMode === 'event' ? hackathonRange.days : 4;
    const calendarSelectedDate = useMemo(
        () => desktopSelectedDate ?? visibleScheduleStartDate.add(1, 'day'),
        [desktopSelectedDate, visibleScheduleStartDate]
    );
    const activeHackathonEvents = useMemo(() => {
        return events.filter((event) => {
            return (
                event.hackathonId === hackathon.id &&
                !event.startTime.isBefore(hackathonRange.startDate) &&
                !event.startTime.isAfter(hackathonRange.endDate)
            );
        });
    }, [events, hackathon.id, hackathonRange]);

    useEffect(() => {
        if (isMobile) {
            return;
        }

        updateYearMonth('set', {
            year: calendarSelectedDate.year(),
            month: calendarSelectedDate.month(),
        });
    }, [calendarSelectedDate, isMobile, updateYearMonth]);

    function setDesktopScheduleDate(date: Dayjs, calendarDate = date) {
        const nextDate = date.startOf('day');
        setDesktopStartDate(nextDate);
        updateYearMonth('set', {
            year: calendarDate.year(),
            month: calendarDate.month(),
        });
    }

    function selectDate(date: Dayjs) {
        const selectedDate = date.startOf('day');
        setDesktopSelectedDate(selectedDate);
        setDesktopScheduleDate(selectedDate.subtract(1, 'day'), selectedDate);
    }

    function handleDesktopDateSelect(date: Date | undefined) {
        if (!date) {
            return;
        }

        selectDate(dayjs(date));
    }

    function handleDesktopMonthChange(date: Date) {
        selectDate(dayjs(date).startOf('month'));
    }

    function shiftRange(days: number) {
        const nextDate = scheduleStartDate.add(days, 'day');
        setDesktopSelectedDate(nextDate.add(1, 'day'));
        setDesktopScheduleDate(nextDate, nextDate.add(1, 'day'));
    }

    function handlePreviousScheduleRange() {
        shiftRange(-2);
    }

    function handleNextScheduleRange() {
        shiftRange(2);
    }

    function handleTodayScheduleRange() {
        selectDate(dayjs());
    }

    const handleAddEvent = useCallback(() => {
        selectEvent();
        setEditMode(true);
    }, [selectEvent, setEditMode]);

    useEffect(() => {
        const interval = setInterval(updateEvents, 30000); // 5 mins
        return () => {
            clearInterval(interval);
        };
    }, [updateEvents]);

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
                            onAddEvent={handleAddEvent}
                            showActions={false}
                            className="px-3 pt-3 pb-2"
                        />
                        {isAdmin && (
                            <ScheduleActions
                                isAdmin={Boolean(isAdmin)}
                                onAddEvent={handleAddEvent}
                                className="justify-end px-3 pb-2"
                            />
                        )}

                        <div className="min-h-0 flex-1">
                            <MobileCalendar
                                events={activeHackathonEvents}
                                isAdmin={Boolean(isAdmin)}
                                onEventRsvpChange={updateEvents}
                            />
                        </div>
                    </>
                ) : (
                    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_18rem] gap-4">
                        <div className="flex min-h-0 flex-col">
                            <ScheduleHeader
                                eyebrow={`${hackathon.name} Schedule`}
                                monthLabel={visibleScheduleStartDate.format(
                                    'MMMM YYYY'
                                )}
                                isAdmin={Boolean(isAdmin)}
                                onAddEvent={handleAddEvent}
                                className="pb-3"
                            />
                            <div className="min-h-0 flex-1">
                                <DaySchedule
                                    days={visibleScheduleDays}
                                    startDate={visibleScheduleStartDate}
                                    events={activeHackathonEvents}
                                    minColumnWidth={200}
                                    maxVisibleColumns={4}
                                    onPreviousRange={
                                        scheduleViewMode === 'week'
                                            ? handlePreviousScheduleRange
                                            : undefined
                                    }
                                    onToday={
                                        scheduleViewMode === 'week'
                                            ? handleTodayScheduleRange
                                            : undefined
                                    }
                                    onNextRange={
                                        scheduleViewMode === 'week'
                                            ? handleNextScheduleRange
                                            : undefined
                                    }
                                    viewMode={scheduleViewMode}
                                    onViewModeChange={setScheduleViewMode}
                                    onEventRsvpChange={updateEvents}
                                    isAdmin={Boolean(isAdmin)}
                                />
                            </div>
                        </div>

                        <aside className="flex min-h-0 flex-col gap-4">
                            <Card className="flex-none overflow-hidden bg-neutral-900">
                                <Calendar
                                    mode="single"
                                    month={monthObj.toDate()}
                                    selected={calendarSelectedDate.toDate()}
                                    onSelect={handleDesktopDateSelect}
                                    onMonthChange={handleDesktopMonthChange}
                                    className="w-full p-4"
                                />
                            </Card>
                            <ScheduleEventsCard
                                events={activeHackathonEvents}
                            />
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
    onAddEvent,
    showActions = true,
    className,
}: {
    eyebrow: string;
    monthLabel: string;
    isAdmin: boolean;
    onAddEvent: () => void;
    showActions?: boolean;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'relative z-[150] flex items-center gap-3',
                className
            )}
        >
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
                    onAddEvent={onAddEvent}
                    className="ml-auto"
                />
            )}
        </div>
    );
}

function ScheduleActions({
    isAdmin,
    onAddEvent,
    className,
}: {
    isAdmin: boolean;
    onAddEvent: () => void;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'relative z-[150] flex shrink-0 items-center gap-2',
                className
            )}
        >
            {isAdmin && <EventAdminButton onAddEvent={onAddEvent} />}
            <AnnouncementsButton className="shrink-0" />
        </div>
    );
}

function EventAdminButton({ onAddEvent }: { onAddEvent: () => void }) {
    return (
        <Button
            type="button"
            onClick={onAddEvent}
            size="compact"
            variant="brand"
            hierarchy="primary"
            className="[&>span]:py-[7px]"
        >
            <span>
                <PlusIcon
                    style={{
                        display: 'inline-block',
                        width: '16px',
                    }}
                />
                Add Event
            </span>
        </Button>
    );
}
