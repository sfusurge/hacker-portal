'use client';

import { DaySchedule } from '@/components/calendar/DaySchedule/DaySchedule';
import {
    currentYearMonthAtom,
    selectedEventAtom,
} from '@/components/calendar/MonthCalendarShared';
import { Button } from '@/components/ui/button';
import { ToggleButton } from '@/components/ui/ToggleButton/ToggleButton';
import { CalendarEvent } from '@/server/routers/eventsRouter';
import dayjs from 'dayjs';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { userInfoAtom } from '../ClientAuthContext';
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
import { useWindowSize } from '@/lib/utils';
import { MobileMonthCalendar } from '@/components/calendar/MobileMonthCalendar/MobileMonthCalendar';
import { trpc } from '@/trpc/client';
import { useHackathon } from '@/hooks/use-hackathon';

export function ClientCalendarPage({
    events: _events,
}: {
    events: CalendarEvent[];
}) {
    const eventsAtom = useMemo(() => atom(_events), [_events]);
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
    const isMobile = useMemo(() => width <= 768, [width]);

    const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
    const [editMode, setEditMode] = useAtom(editModeAtom);

    const { hackathon } = useHackathon();

    const fetchEvents = trpc.events.getEvents.useQuery(
        { hackathonId: hackathon?.id! },
        { enabled: false }
    );

    useEffect(() => {
        async function updateEvents() {
            if (!hackathon || !hackathon.id) {
                return;
            }
            const res = await fetchEvents.refetch();
            setEvents(
                res.data?.map((item) => {
                    return {
                        ...item,
                        startDate: new Date(item.startDate),
                        endDate: new Date(item.endDate),
                    };
                }) ?? []
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
                    }}
                >
                    {/* header */}
                    {!isMobile && showCalendar && (
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
                                <ChevronLeftIcon
                                    style={{ display: 'block', width: '16px' }}
                                />
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
                                <ChevronRightIcon
                                    style={{ display: 'block', width: '16px' }}
                                />
                            </Button>
                        </>
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
                            style={{ position: 'relative', zIndex: 1000 }}
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
                            days={7}
                            minColumnWidth={300}
                            startDate={hackathon?.startDate ?? dayjs()}
                            events={events}
                        />
                    )}
                    {!isMobile && showCalendar && (
                        <MonthCalendar events={events} />
                    )}

                    {/* Mobile */}
                    {isMobile && <MobileMonthCalendar events={events} />}
                </div>
            </div>
        </>
    );
}
