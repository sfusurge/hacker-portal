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

import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { DialogTitle } from '@/components/ui/dialog';
import { DaySchedule } from '@/components/calendar/DaySchedule/DaySchedule';

export function MobileMonthCalendar({
    events,
}: {
    events: InternalCalendarEventType[];
}) {
    const [{ year, month }, updateYearMonth] = useAtom(currentYearMonthAtom);
    const [currMonth] = useMemo(
        () => [dayjs(new Date(year, month, 1))],
        [year, month]
    );

    const [selectedDay, setSelectedDay] = useAtom(selectedDayAtom);

    const timelineRef = useRef<HTMLDivElement>(null);

    const [maxHeight, setMaxHeight] = useState(0);

    const filteredEvents = useMemo(
        () => getEventsOfMonth(events, month, year, false),
        [year, month]
    );

    const [dayEvents, setDayEvents] = useState<
        InternalCalendarEventType[] | undefined
    >();

    useEffect(() => {
        if (timelineRef.current) {
            setMaxHeight(window.innerHeight - timelineRef.current.offsetTop);
        }
    }, [timelineRef.current]);

    return (
        <>
            <Drawer
                open={dayEvents !== undefined}
                onClose={() => {
                    setDayEvents(undefined);
                }}
            >
                <DrawerContent>
                    <DialogTitle style={{ display: 'none' }}>
                        Events of {selectedDay?.format('MMM DD')}
                    </DialogTitle>

                    <div
                        style={{
                            width: '100%',
                            maxHeight: '70dvh',
                            height: '1000px',
                            marginTop: '2rem',
                        }}
                    >
                        <DaySchedule
                            days={1}
                            events={dayEvents ?? []}
                            minColumnWidth={200}
                            startDate={selectedDay ?? dayjs()}
                        />
                    </div>
                </DrawerContent>
            </Drawer>
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
                {/* <Calendar
                    style={{
                        width: 'min-content',
                    }}
                    defaultMonth={currMonth.toDate()}
                    modifiers={{
                        hasEvent: filteredEvents.map((e) => {
                            return e.startTime.toDate();
                        }),
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
                /> */}

                <LinearTimeline
                    events={filteredEvents}
                    daySelected={(eventsOfDay) => {
                        setDayEvents(eventsOfDay);
                    }}
                />
            </div>
        </>
    );
}
