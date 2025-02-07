'use client';

import { CSSProperties, useMemo, useRef } from 'react';
import { CalendarEventType, MonthInfoType } from '../types';
import dayjs, { Dayjs } from 'dayjs';
import style from './MonthCalendar.module.css';
import { Provider, useAtom, useSetAtom } from 'jotai';
import {
    getEventsOfMonth,
    groupEventsByDay,
    selectedEventAtom,
    selectedDayAtom,
    yearMonthDay,
    currentYearMonthAtom,
    DayjsifyEvents,
    InternalCalendarEventType,
} from '../MonthCalendarShared';
import { DynamicMessage } from '../DynamicMessage';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

function getMonthInfo(year: number, month: number): MonthInfoType {
    const target = dayjs(new Date(year, month, 1));

    return {
        month,
        year,
        daysInMonth: target.daysInMonth(),
        displayName: target.format('MMMM DD, YYYY'), // November 23, 2024
        firstDayOffset: target.day(), // day in week of the first day.
        weeksInMonth: Math.ceil((target.daysInMonth() + target.day()) / 7),
        weekdayNames: [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ],
    } as MonthInfoType;
}

function range(count: number) {
    const out = Array(count);

    for (let i = 0; i < count; i++) {
        out[i] = i;
    }

    return out;
}

/**
 * TODOs
 * * Add handles/atoms to select current month, and starting month
 * * Add callbacks or atom for currently selected day, selected event
 *
 */
export function MonthCalendar(props: { events: InternalCalendarEventType[] }) {
    // just a wrapper to provide Provider for context.
    return (
        <Provider>
            <MonthCalendarContent {...props}></MonthCalendarContent>
        </Provider>
    );
}

export function MonthCalendarContent({
    events,
}: {
    events: InternalCalendarEventType[];
}) {
    const [{ year, month }, updateYearMonth] = useAtom(currentYearMonthAtom);

    const monthInfo = useMemo(() => {
        return getMonthInfo(year, month);
    }, [year, month]);

    // filter to only include events of the current month, grouped by day, each day's event sorted by title alphabetically.
    const eventsOfMonth = useMemo<{
        [dayOfMonth: number]: InternalCalendarEventType[];
    }>(
        () =>
            // have a view of only this month
            groupEventsByDay(getEventsOfMonth(events, month, year)),
        [year, month]
    );

    const [prevMonth, currMonth, nextMonth] = useMemo(
        () => [
            dayjs(new Date(year, month, 1)).month(-1),
            dayjs(new Date(year, month, 1)),
            dayjs(new Date(year, month, 1)).month(1),
        ],
        [year, month]
    );

    const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
    const renderRootRef = useRef<HTMLDivElement>(null);

    return (
        <div>
            {/* Week day name row, such as Sun, Mon, Tues, ... */}
            <div className={style.weekdayNameRow}>
                {monthInfo.weekdayNames.map((item, index) => (
                    <span key={item} className={style.weekdayName}>
                        {item}
                    </span>
                ))}
            </div>
            <div ref={renderRootRef} className={style.calendarRenderRoot}>
                {/* AnimatePresence needed for framer motion, needs to always exist and wrap content. 
                (As in, content is toggling within AnimatePresence. TODO: Refactor into it's own component)
                */}

                <AnimatePresence>
                    {selectedEvent && selectedEvent.element && (
                        <DynamicMessage
                            rootRef={renderRootRef.current!}
                            parentRef={selectedEvent.element}
                            closeLabel={() => {
                                // disable prompt
                                setSelectedEvent(undefined);
                            }}
                        >
                            <Card
                                style={{
                                    border: `2px solid ${selectedEvent.event.color}`,
                                    minWidth: '200px',
                                }}
                            >
                                <CardHeader>
                                    {selectedEvent.event.title}
                                </CardHeader>

                                <CardContent>
                                    {selectedEvent.event.description}
                                </CardContent>
                            </Card>
                        </DynamicMessage>
                    )}
                </AnimatePresence>

                <div
                    className={style.calendarContainer}
                    style={
                        {
                            '--rowCount': monthInfo.weeksInMonth,
                        } as CSSProperties
                    }
                >
                    {/* Day in month, each row is a week as a flex row
                then each row contains items for each day.
            */}

                    {range(monthInfo.weeksInMonth).map((weekIdx) => (
                        <div key={weekIdx} className={style.monthDayRow}>
                            {range(7).map((dayIdx) => {
                                // use current row, col and firstday offset to find each day is it currently
                                const d =
                                    weekIdx * 7 +
                                    dayIdx +
                                    1 -
                                    monthInfo.firstDayOffset;

                                // invalid days
                                if (d < 1 || d > currMonth.daysInMonth()) {
                                    return (
                                        <OutOfBoundMonthDay
                                            key={d}
                                            day={d}
                                            currMonth={currMonth}
                                            prevMonth={prevMonth}
                                        ></OutOfBoundMonthDay>
                                    );
                                }

                                return (
                                    <MonthDay
                                        // pass events of particular day to the matching day
                                        events={eventsOfMonth[d] ?? []}
                                        key={d}
                                        date={dayjs(new Date(year, month, d))}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function OutOfBoundMonthDay({
    day,
    prevMonth,
    currMonth,
}: {
    day: number;
    prevMonth: Dayjs;
    currMonth: Dayjs;
}) {
    let label = -1;

    if (day < 1) {
        label = prevMonth.daysInMonth() + day;
    }

    if (day > currMonth.daysInMonth()) {
        label = day - currMonth.daysInMonth();
    }

    return (
        <div className={cn(style.monthDayItem, style.disabled)}>
            <span className={style.monthDayLabel}>{label}</span>
        </div>
    );
}
function MonthDay({
    date,
    events,
}: {
    date: Dayjs;
    events: InternalCalendarEventType[];
}) {
    date = yearMonthDay(date);
    const [selected, setSelected] = useAtom(selectedDayAtom);

    return (
        <div
            className={style.monthDayItem}
            onClick={() => {
                if (!date.isSame(selected, 'date')) {
                    setSelected(date);
                } else {
                    setSelected(undefined);
                }
            }}
        >
            <span
                className={`${style.monthDayLabel} ${selected?.isSame(date, 'date') ? style.selected : ''}`}
            >
                {date.date()}
            </span>
            {events.map((item) => (
                <MonthDayEvent key={item.id} event={item}></MonthDayEvent>
            ))}
        </div>
    );
}

function MonthDayEvent({ event }: { event: InternalCalendarEventType }) {
    const setSelectedEvent = useSetAtom(selectedEventAtom);
    const ref = useRef<HTMLDivElement>(null);
    return (
        <div
            ref={ref}
            className={style.monthEventItem}
            style={
                {
                    '--eventBackground': event.color,
                } as CSSProperties
            }
            onClick={() => {
                setSelectedEvent({ event, element: ref.current! });
            }}
        >
            {event.title}
        </div>
    );
}
