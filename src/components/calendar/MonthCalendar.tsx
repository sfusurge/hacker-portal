'use client';

import { CSSProperties, useMemo, useRef } from 'react';
import { CalendarEventType, MonthInfoType } from './types';
import dayjs, { Dayjs } from 'dayjs';
import style from './MonthCalendar.module.css';
import { useAtom, useSetAtom } from 'jotai';
import {
    getEventsOfMonth,
    groupEventsByDay,
    selectedEventAtom,
    selectedDayAtom,
    yearMonthDay,
} from './MonthCalendarShared';
import { DynamicMessage } from './DynamicMessage';
import { Card, CardContent, CardHeader } from '../ui/card';
import { AnimatePresence } from 'motion/react';

function getMonthInfo(year: number, month: number): MonthInfoType {
    const target = dayjs(new Date(year, month, 1));

    return {
        month,
        year,
        daysInMonth: target.daysInMonth(),
        displayName: target.format('MMMM DD, YYYY'), // November 23, 2024
        firstDayOffset: target.day(), // day in week of the first day.
        weeksInMonth: Math.ceil((target.daysInMonth() + target.day()) / 7),
        weekdayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'],
    } as MonthInfoType;
}

function range(count: number) {
    const out = Array(count);

    for (let i = 0; i < count; i++) {
        out[i] = i;
    }

    return out;
}

export function MonthCalendar(props: { events: CalendarEventType[] }) {
    // just a wrapper to provide Provider for context.
    return <MonthCalendarContent {...props}></MonthCalendarContent>;
}

export function MonthCalendarContent({
    events,
}: {
    events: CalendarEventType[];
}) {
    const [year, month] = [2024, 11]; // for testing, month is 0 indexed

    const monthInfo = useMemo(() => {
        return getMonthInfo(year, month);
    }, [year, month]);

    // filter to only include events of the current month, grouped by day, each day's event sorted by title alphabetically.
    const eventsOfMonth = useMemo<{
        [dayOfMonth: number]: CalendarEventType[];
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
                    {/* Week day name row, such as Sun, Mon, Tues, ... */}
                    <div className={style.weekdayNameRow}>
                        {monthInfo.weekdayNames.map((item, index) => (
                            <span key={item} className={style.weekdayName}>
                                {item}
                            </span>
                        ))}
                    </div>

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
        <div className={style.monthDayItem}>
            <div
                style={{
                    background: 'grey',
                    opacity: '0.3',
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    zIndex: '1',
                    width: '100%',
                    height: '100%',
                }}
            ></div>
            <span className={style.monthDayLabel}>{label}</span>
        </div>
    );
}
function MonthDay({
    date,
    events,
}: {
    date: Dayjs;
    events: CalendarEventType[];
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

function MonthDayEvent({ event }: { event: CalendarEventType }) {
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
