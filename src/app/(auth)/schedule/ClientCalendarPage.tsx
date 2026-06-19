'use client';

import { DaySchedule } from '@/components/calendar/DaySchedule/DaySchedule';
import {
    currentYearMonthAtom,
    DayjsifyEvents,
    selectedEventAtom,
} from '@/components/calendar/MonthCalendarShared';
import { Button } from '@/components/ui/button';
import { ToggleButton } from '@/components/ui/ToggleButton/ToggleButton';
import { CalendarEvent } from '@/server/routers/eventsRouter';
import dayjs from 'dayjs';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { userInfoAtom } from '../ClientContext';
import { MonthCalendar } from '@/components/calendar/MonthCalendar/MonthCalendar';
import {
    editModeAtom,
    EventAdmin,
} from '@/components/calendar/EventAdmin/EventAdmin';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PencilIcon,
    PlusIcon,
} from '@heroicons/react/24/solid';
import { useWindowSize } from '@/lib/useWindowSize';
import { trpc } from '@/trpc/client';
import { MobileCalendar } from '@/components/calendar/MobileMonthCalendar/MobileCalendar';

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
        () => userInfo && userInfo.userRole === 'admin',
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

    const [width, height] = useWindowSize();
    const [showSchedule, setShowSchedule] = useState(true);
    const showCalendar = useMemo(() => !showSchedule, [showSchedule]);
    const eventStarted = useMemo(() => {
        return (
            dayjs().isAfter(dayjs(hackathon.startDate).startOf('day')) &&
            dayjs().isBefore(hackathon.endDate)
        );
    }, [hackathon]);
    const isMobile = useMemo(() => width <= 768, [width]);

    const [selectedEvent, _] = useAtom(selectedEventAtom);
    const [editMode, setEditMode] = useAtom(editModeAtom);

    const fetchEvents = trpc.events.getEvents.useQuery(
        { hackathonId: hackathon?.id! },
        { enabled: false }
    );

    const [weekOffset, setWeekOffset] = useState(0);

    function getStartDate(period: number) {
        const dayOffset = weekOffset * period;
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
            return minDate.startOf('day').add(dayOffset, 'day');
        } else if (today.isBefore(lastDay)) {
            return firstDay.startOf('day').add(dayOffset, 'day');
        } else {
            // after event, just display today
            return today.add(dayOffset, 'day');
        }
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
                className="flex flex-col"
                style={{ height: '100%', opacity: loaded ? 1 : 0 }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.5rem',
                        flexFlow: 'wrap',
                        gap: '0.25rem',
                        position: isAdmin && isMobile ? 'sticky' : 'initial',
                        top: '5rem',
                        zIndex: 1000,
                    }}
                >
                    {/* header */}
                    {!isMobile && showCalendar && (
                        <MonthControl
                            monthObj={monthObj}
                            updateYearMonth={updateYearMonth}
                        />
                    )}

                    {!isMobile && showSchedule && (
                        <WeekControl
                            reset={() => {
                                setWeekOffset(0);
                            }}
                            updateWeek={(d) => {
                                setWeekOffset(weekOffset + d);
                            }}
                        />
                    )}

                    {!isMobile && (
                        <ToggleButton
                            A="Day"
                            B="Month"
                            onToggle={(val) => {
                                setShowSchedule(!val);
                            }}
                            toggle={showCalendar}
                            style={{ marginLeft: 'auto', marginRight: '1rem' }}
                        />
                    )}

                    {isAdmin && (
                        <Button
                            onClick={() => {
                                setEditMode(!editMode);
                            }}
                            size="compact"
                            variant="brand"
                            hierarchy="primary"
                        >
                            {selectedEvent?.event ? (
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
                    )}
                </div>

                <div style={{ flex: '1', minHeight: '0' }}>
                    {/* DESKTOP */}
                    {!isMobile && showSchedule && (
                        <DaySchedule
                            days={eventStarted ? 2 : 7}
                            startDate={getStartDate(eventStarted ? 2 : 7)}
                            events={events}
                            minColumnWidth={200}
                        />
                    )}
                    {!isMobile && showCalendar && (
                        <MonthCalendar events={events} />
                    )}

                    {/* Mobile */}
                    {isMobile && <MobileCalendar events={events} />}
                </div>
            </div>
        </>
    );
}

function WeekControl({
    reset,
    updateWeek,
}: {
    reset: () => void;
    updateWeek: (delta: number) => void;
}) {
    return (
        <>
            <Button
                size="compact"
                hierarchy="secondary"
                variant="default"
                onClick={() => {
                    updateWeek(-1);
                }}
            >
                <ChevronLeftIcon style={{ display: 'block', width: '16px' }} />
            </Button>

            <Button
                size="compact"
                hierarchy="secondary"
                variant="default"
                onClick={() => {
                    reset();
                }}
            >
                Reset
            </Button>

            <Button
                size="compact"
                hierarchy="secondary"
                variant="default"
                onClick={() => {
                    updateWeek(+1);
                }}
            >
                <ChevronRightIcon style={{ display: 'block', width: '16px' }} />
            </Button>
        </>
    );
}

function MonthControl({
    monthObj,
    updateYearMonth,
}: {
    monthObj: dayjs.Dayjs;
    updateYearMonth: (
        changeType: 'set' | '+1 month' | '-1 month',
        newVal?: { year: number; month: number } | undefined
    ) => void;
}) {
    return (
        <>
            <span style={{ fontSize: 'large' }}>
                {monthObj.format('MMMM YYYY')}
            </span>
            <Button
                size="compact"
                hierarchy="secondary"
                variant="default"
                onClick={() => {
                    updateYearMonth('-1 month');
                }}
            >
                <ChevronLeftIcon style={{ display: 'block', width: '16px' }} />
            </Button>
            <Button
                size="compact"
                hierarchy="secondary"
                variant="default"
                onClick={() => {
                    updateYearMonth('set', {
                        year: dayjs().year(),
                        month: dayjs().month(),
                    });
                }}
            >
                Today
            </Button>
            <Button
                size="compact"
                hierarchy="secondary"
                variant="default"
                onClick={() => {
                    updateYearMonth('+1 month');
                }}
            >
                <ChevronRightIcon style={{ display: 'block', width: '16px' }} />
            </Button>
        </>
    );
}
