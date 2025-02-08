'use client';

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarEventType, MonthInfoType } from '../types';
import dayjs, { Dayjs } from 'dayjs';
import style from './MonthCalendar.module.css';
import { atom, Provider, useAtom, useAtomValue, useSetAtom } from 'jotai';
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
    return <MonthCalendarContent {...props}></MonthCalendarContent>;
}

const rowHeightAtom = atom(170);
export function MonthCalendarContent({
    events,
}: {
    events: InternalCalendarEventType[];
}) {
    const [{ year, month }, updateYearMonth] = useAtom(currentYearMonthAtom);

    const monthInfo = useMemo(() => {
        console.log('cuange');
        return getMonthInfo(year, month);
    }, [year, month]);

    // filter to only include events of the current month, grouped by day, each day's event sorted by title alphabetically.
    const eventsOfMonth = useMemo<{
        [dayOfMonth: number]: InternalCalendarEventType[];
    }>(() => {
        console.log('adasdas', dayjs(new Date(year, month, 1)));
        // have a view of only this month
        return groupEventsByDay(
            getEventsOfMonth(events, month, year),
            dayjs(new Date(year, month, 1))
        );
    }, [year, month]);

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

    const setRowHeight = useSetAtom(rowHeightAtom);
    useEffect(() => {
        const resizeObserver = new ResizeObserver((e) => {
            const height = e[0].contentRect.height;
            setRowHeight(Math.floor(height / 5));
        });

        resizeObserver.observe(renderRootRef.current!);

        return () => resizeObserver.disconnect();
    }, []);

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
                                // if (d < 1 || d > currMonth.daysInMonth()) {
                                //     return (
                                //         <OutOfBoundMonthDay
                                //             key={d}
                                //             day={d}
                                //             currMonth={currMonth}
                                //             prevMonth={prevMonth}
                                //         ></OutOfBoundMonthDay>
                                //     );
                                // }

                                return (
                                    <MonthDay
                                        // pass events of particular day to the matching day
                                        events={eventsOfMonth[d] ?? []}
                                        key={d}
                                        date={dayjs(new Date(year, month, d))}
                                        disabled={
                                            d < 1 || d > currMonth.daysInMonth()
                                        }
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

const maxItemsAtom = atom((get) => {
    return Math.max(0, Math.floor(get(rowHeightAtom) / 30 - 2)); // 30px per item, -1 for date number, -1 for "more item" item.
});

function MonthDay({
    date,
    events,
    disabled = false,
}: {
    date: Dayjs;
    events: InternalCalendarEventType[];
    disabled: boolean;
}) {
    date = yearMonthDay(date);
    const [selected, setSelected] = useAtom(selectedDayAtom);

    const [viewAll, setViewAll] = useState(false);
    const maxItems = useAtomValue(maxItemsAtom);
    const itemRef = useRef<HTMLDivElement>(null);

    function clickOutside(e: Event) {
        if (
            itemRef.current &&
            !itemRef.current.contains(e.target! as Node) &&
            !e.defaultPrevented
        ) {
            // hide extra events if clicked outside
            hide();
        }
    }

    function showAll() {
        // show extra events
        setViewAll(true);
        document.addEventListener('click', clickOutside, true);
    }

    function hide() {
        setViewAll(false);
        document.removeEventListener('click', clickOutside, true);
    }

    return (
        <div
            ref={itemRef}
            className={cn(
                style.monthDayItem,
                viewAll && style.extended,
                disabled && style.disabled
            )}
            style={
                {
                    '--maxHeight': `${events.length * 30 + 30}px`,
                } as CSSProperties
            }
            onClick={() => {
                if (!date.isSame(selected, 'date')) {
                    setSelected(date);
                    showAll();
                } else {
                    setSelected(undefined);
                    hide();
                }
            }}
        >
            <span
                className={`${style.monthDayLabel} ${selected?.isSame(date, 'date') ? style.selected : ''}`}
            >
                {date.date()}
            </span>
            <div
                className={cn(
                    style.monthEventContainer,
                    viewAll && style.extended
                )}
            >
                {events.map((item, index) => {
                    if (index <= maxItems || viewAll) {
                        return (
                            <MonthDayEvent
                                key={item.id}
                                event={item}
                            ></MonthDayEvent>
                        );
                    }
                })}
                {!viewAll && events.length > maxItems + 1 && (
                    <EventHolder
                        color="#4338CA"
                        content={`${events.length - maxItems} more...`}
                        onclick={showAll}
                    ></EventHolder>
                )}
            </div>
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
            onClick={(e) => {
                e.stopPropagation();
                setSelectedEvent({ event, element: ref.current! });
            }}
        >
            {event.title}
        </div>
    );
}

function EventHolder({
    color,
    content,
    onclick,
}: {
    color: string;
    content: string;
    onclick: () => void;
}) {
    return (
        <div
            className={style.monthEventItem}
            style={
                {
                    '--eventBackground': color,
                } as CSSProperties
            }
            onClick={onclick}
        >
            {content}
        </div>
    );
}
