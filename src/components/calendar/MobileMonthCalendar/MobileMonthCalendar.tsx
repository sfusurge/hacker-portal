'use client';

import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';

import { useState, useMemo, useRef, useEffect, CSSProperties } from 'react';
import style from './MobileMonthCalendar.module.css';
import { LinearTimeline } from '../LinearTimeLine/LinearTimeline';
import {
    selectedDayAtom,
    getEventsOfMonth,
    yearMonthDay,
    InternalCalendarEventType,
    currentYearMonthAtom,
    DayjsifyEvents,
} from '../MonthCalendarShared';

import { Calendar } from '@/components/ui/calendar';
import { CalendarEvent } from '@/server/routers/eventsRouter';

export function MobileMonthCalendar({
    events: _events,
}: {
    events: CalendarEvent[];
}) {
    const events = useMemo(() => {
        return DayjsifyEvents(_events);
    }, []);

    const [{ year, month }, updateYearMonth] = useAtom(currentYearMonthAtom);
    const [currMonth] = useMemo(
        () => [dayjs(new Date(year, month, 1))],
        [year, month]
    );

    const [selectedDay, setSelectedDay] = useAtom(selectedDayAtom);

    const timelineRef = useRef<HTMLDivElement>(null);

    const [maxHeight, setMaxHeight] = useState(0);

    const filteredEvents = useMemo(
        () => getEventsOfMonth(events, month, year),
        [year, month]
    );

    useEffect(() => {
        if (timelineRef.current) {
            setMaxHeight(window.innerHeight - timelineRef.current.offsetTop);
        }
    }, [timelineRef.current]);

    return (
        <div
            className={style.calendarContainer}
            ref={timelineRef}
            style={
                {
                    '--maxHeight': `${maxHeight}px`,
                    overflow: 'hidden',
                } as CSSProperties
            }
        >
            <Calendar
                style={{
                    width: 'min-content',
                }}
                defaultMonth={currMonth.toDate()}
                modifiers={{
                    hasEvent: filteredEvents.map((e) => e.startTime.toDate()),
                }}
                modifiersClassNames={{
                    hasEvent: 'hasEvent',
                }}
                selected={selectedDay?.toDate()}
                onDayClick={(d, a, e) => {
                    if (!dayjs(d).isSame(selectedDay, 'date')) {
                        setSelectedDay(yearMonthDay(dayjs(d)));
                    } else {
                        setSelectedDay(undefined);
                    }
                }}
                onMonthChange={(m) => {
                    updateYearMonth('set', {
                        year: m.getFullYear(),
                        month: m.getMonth(),
                    });
                }}
            />

            <LinearTimeline events={filteredEvents} />
        </div>
    );
}
