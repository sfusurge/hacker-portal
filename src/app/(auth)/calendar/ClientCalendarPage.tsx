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
import { useMemo, useState } from 'react';
import { L } from 'vitest/dist/chunks/reporters.D7Jzd9GS.js';
import { userInfoAtom } from '../ClientAuthContext';
import { MonthCalendar } from '@/components/calendar/MonthCalendar/MonthCalendar';

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

    const [showSchedule, setShowSchedule] = useState(true);
    const showCalendar = useMemo(() => !showSchedule, [showSchedule]);

    const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);

    // TODO Mobile mode

    return (
        <div className="flex flex-col" style={{ height: '100%' }}>
            <div className="flex" style={{ alignItems: 'center' }}>
                {/* header */}
                <span>{monthObj.format('YYYY-MMM')}</span>
                <Button
                    onClick={() => {
                        updateYearMonth('-1 month');
                    }}
                >
                    Prev
                </Button>
                <Button
                    variant="brand"
                    onClick={() => {
                        updateYearMonth('set', {
                            year: dayjs().year(),
                            month: dayjs().month(),
                        });
                    }}
                >
                    Current
                </Button>
                <Button
                    size="compact"
                    hierarchy="primary"
                    variant="brand"
                    onClick={() => {
                        updateYearMonth('+1 month');
                    }}
                >
                    Next
                </Button>

                <ToggleButton
                    A="Day"
                    B="Month"
                    onToggle={(val) => {
                        setShowSchedule(!val);
                    }}
                    toggle={showCalendar}
                />

                {isAdmin && (
                    <Button>
                        {selectedEvent?.event ? (
                            <span>Edit Event</span>
                        ) : (
                            <span>Add Event</span>
                        )}
                    </Button>
                )}
            </div>

            <div style={{ flex: '1', minHeight: '0' }}>
                {showSchedule && (
                    <DaySchedule
                        days={1}
                        minColumnWidth={300}
                        startDate={dayjs(new Date(2025, 1, 14))}
                        events={events}
                    />
                )}

                {showCalendar && <MonthCalendar events={events} />}
            </div>
        </div>
    );
}
