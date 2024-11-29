'use client';

import { CSSProperties, useMemo, useRef, useState } from 'react';
import { CalendarEventType, MonthInfoType } from './types';
import moment from 'moment';
import style from './MonthCalendar.module.css';
import { atom, useAtom, useSetAtom, useAtomValue, Provider } from 'jotai';
import {
    getEventsOfMonth,
    groupEventsByDay,
    selectedEventAtom,
} from './MonthCalendarShared';
import { DynamicMessage } from './DynamicMessage';
import { Card, CardContent, CardHeader } from '../ui/card';
moment.locale('en-CA'); // lock local to canada, no need to support calendar format aroudn the world

function getMonthInfo(year: number, month: number): MonthInfoType {
    const target = moment({
        year,
        month,
        day: 1,
    });

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
    return (
        <Provider>
            <MonthCalendarContent {...props}></MonthCalendarContent>
        </Provider>
    );
}

export function MonthCalendarContent({
    events,
}: {
    events: CalendarEventType[];
}) {
    const [year, month] = [2024, 10]; // for testing, month is 0 indexed

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

    const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
    const renderRootRef = useRef<HTMLDivElement>(null);

    return (
        <div>
            <h1>{monthInfo.displayName}</h1>

            <h1>Currently seleced event: {selectedEvent?.event?.title}</h1>

            <div ref={renderRootRef} className={style.calendarRenderRoot}>
                {
                    // selected event prompt
                    selectedEvent && (
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
                    )
                }

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
                            <span key={index} className={style.weekdayName}>
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
                                return (
                                    <MonthDay
                                        // pass events of particular day to the matching day
                                        events={
                                            eventsOfMonth[d] !== undefined
                                                ? eventsOfMonth[d]
                                                : []
                                        }
                                        key={dayIdx}
                                        day={d}
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

function MonthDay({
    day,
    events,
}: {
    day: number;
    events: CalendarEventType[];
}) {
    if (day <= 0) {
        return <div className={style.monthDayItem}></div>;
    }

    const [selected, setSelected] = useState(false);

    return (
        <div
            className={style.monthDayItem}
            onClick={() => {
                setSelected(!selected);
            }}
        >
            <span
                className={`${style.monthDayLabel} ${selected ? style.selected : ''}`}
            >
                {day}
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
