import {
    currentYearMonthAtom,
    getEventsOfMonth,
    getMonthInfo,
    groupEventsByDay,
    InternalCalendarEventType,
    range,
    selectedDayAtom,
} from '@/components/calendar/MonthCalendarShared';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import style from './MobileCalendar.module.css';
import { LinearTimeline } from '@/components/calendar/LinearTimeLine/LinearTimeline';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { DialogTitle } from '@radix-ui/react-dialog';
import { DaySchedule } from '@/components/calendar/DaySchedule/DaySchedule';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import clsx from 'clsx';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
dayjs.extend(dayOfYear);

const firstdayAtom = atom((get) => {
    const { year, month } = get(currentYearMonthAtom);
    return dayjs(new Date(year, month, 1));
});

export function MobileCalendar({
    events,
}: {
    events: InternalCalendarEventType[];
}) {
    const [{ year, month }, updateYearMonth] = useAtom(currentYearMonthAtom);
    const firstDay = useAtomValue(firstdayAtom);
    const [selectedDay, setSelectedDay] = useAtom(selectedDayAtom);

    const filteredEvents = useMemo(
        () => getEventsOfMonth(events, month, year, false),
        [year, month, events]
    );

    // filters to get a set of days that has an event.
    const daysWithEvents = useMemo(() => {
        const out = new Set<number>();
        for (const e of filteredEvents) {
            const dayid = e.startTime.dayOfYear() - firstDay.dayOfYear() + 1;
            if (!out.has(dayid)) {
                out.add(dayid);
            }
        }
        return out;
    }, [filteredEvents, firstDay]);

    const eventGroupedByDay = useMemo(() => {
        return groupEventsByDay(
            filteredEvents,
            dayjs(new Date(year, month, 1))
        );
    }, [filteredEvents, year, month]);

    const dayEvents = useMemo(() => {
        if (!selectedDay || !eventGroupedByDay) {
            return [];
        }
        return eventGroupedByDay[selectedDay.date()];
    }, [eventGroupedByDay, selectedDay]);

    return (
        <>
            <Drawer
                open={selectedDay !== undefined}
                onClose={() => {
                    setSelectedDay(undefined);
                }}
            >
                <DrawerContent hideCloseButton>
                    <DialogTitle style={{ display: 'none' }}>
                        Events of {selectedDay?.format('MMM DD')}
                    </DialogTitle>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button
                                variant="default"
                                hierarchy="secondary"
                                onClick={() => {
                                    setSelectedDay(
                                        selectedDay!.subtract(1, 'day')
                                    );
                                }}
                            >
                                <ChevronLeftIcon style={{ width: '20px' }} />
                            </Button>
                            <Button
                                variant="default"
                                hierarchy="secondary"
                                onClick={() => {
                                    setSelectedDay(selectedDay!.add(1, 'day'));
                                }}
                            >
                                <ChevronRightIcon style={{ width: '20px' }} />
                            </Button>
                        </div>
                        <Button
                            variant="default"
                            hierarchy="secondary"
                            style={{ padding: '0.25rem' }}
                            onClick={() => {
                                setSelectedDay(dayjs());
                            }}
                        >
                            Today
                        </Button>
                    </div>

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
                            startDate={selectedDay ?? dayjs()}
                        />
                    </div>
                </DrawerContent>
            </Drawer>

            <div className={style.Page}>
                <CalenderDays daysWithEvent={daysWithEvents} />

                <LinearTimeline eventsGroupedByDay={eventGroupedByDay} />
            </div>
        </>
    );
}

interface MobileCalendarProps {
    daysWithEvent: Set<number>;
}
function CalenderDays({ daysWithEvent }: MobileCalendarProps) {
    const [selectedDay, setSelectedDay] = useAtom(selectedDayAtom);
    const [{ year, month }, updateYearMonth] = useAtom(currentYearMonthAtom);

    const monthInfo = useMemo(() => {
        return getMonthInfo(year, month);
    }, [year, month]);

    const lastMonth = useMemo(() => {
        return monthInfo.firstDay.subtract(1, 'month');
    }, [monthInfo]);

    const firstDay = useAtomValue(firstdayAtom);

    return (
        <Card className={style.Container}>
            <div className={style.ContainerContent}>
                <div className={style.monthIndicator}>
                    <button
                        className={style.arrowButtons}
                        onClick={() => {
                            updateYearMonth('-1 month');
                        }}
                    >
                        <ChevronLeftIcon style={{ width: '1.5rem' }} />
                    </button>
                    <span>{monthInfo.firstDay.format('MMMM YYYY')}</span>
                    <button
                        className={style.arrowButtons}
                        onClick={() => {
                            updateYearMonth('+1 month');
                        }}
                    >
                        <ChevronRightIcon style={{ width: '1.5rem' }} />
                    </button>
                </div>
                <div className={style.DayRow}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                        (item, idx) => (
                            <span key={idx} className={style.DayRowItem}>
                                {item}
                            </span>
                        )
                    )}
                </div>
                {range(monthInfo.weeksInMonth).map((weekidx) => (
                    <div key={weekidx} className={style.DateRow}>
                        {range(7).map((dayidx) => {
                            let d =
                                weekidx * 7 +
                                dayidx +
                                1 -
                                monthInfo.firstDayOffset;
                            let dayId = d;
                            const OOB = d < 1 || d > monthInfo.daysInMonth;
                            if (d < 1) {
                                d += lastMonth.daysInMonth();
                            } else if (d > monthInfo.daysInMonth) {
                                d -= monthInfo.daysInMonth;
                            }

                            return (
                                <button
                                    key={d}
                                    className={clsx(
                                        style.DateButton,
                                        OOB && style.OOB,
                                        dayId ===
                                            (selectedDay?.dayOfYear() ?? 0) -
                                                firstDay.dayOfYear() +
                                                1 && style.selected,

                                        daysWithEvent.has(dayId) &&
                                            style.hasEvent
                                    )}
                                    onClick={() => {
                                        console.log(
                                            (selectedDay?.dayOfYear() ?? 0) -
                                                firstDay.dayOfYear() +
                                                1
                                        );

                                        setSelectedDay(
                                            dayjs(new Date(year, month, 1)).add(
                                                dayId - 1,
                                                'day'
                                            )
                                        );
                                    }}
                                >
                                    {d}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </Card>
    );
}
