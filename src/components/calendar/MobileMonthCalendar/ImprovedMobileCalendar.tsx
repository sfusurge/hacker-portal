import {
    currentYearMonthAtom,
    getEventsOfMonth,
    getMonthInfo,
    InternalCalendarEventType,
    range,
    selectedDayAtom,
} from '@/components/calendar/MonthCalendarShared';
import { useAtom, useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import style from './ImproveMobileCalendar.module.css';
import { LinearTimeline } from '@/components/calendar/LinearTimeLine/LinearTimeline';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { DialogTitle } from '@radix-ui/react-dialog';
import { DaySchedule } from '@/components/calendar/DaySchedule/DaySchedule';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { Card, CardContent } from '@/components/ui/card';

export function ImprovedMobileCalendar({
    events,
}: {
    events: InternalCalendarEventType[];
}) {
    const [{ year, month }, updateYearMonth] = useAtom(currentYearMonthAtom);
    const firstDay = useMemo(
        () => dayjs(new Date(year, month, 1)),
        [year, month]
    );
    const [selectedDay, setSelectedDay] = useAtom(selectedDayAtom);

    const filteredEvents = useMemo(
        () => getEventsOfMonth(events, month, year, false),
        [year, month, events]
    );

    // filters to get a set of days that has an event.
    const daysWithEvents = useMemo(() => {
        const out = new Set<number>();
        for (const e of filteredEvents) {
            const dayid = Math.ceil(e.startTime.diff(firstDay, 'day', true));
            if (!out.has(dayid)) {
                out.add(dayid);
            }
        }
        return out;
    }, [filteredEvents, firstDay]);

    const [dayEvents, setDayEvents] = useState<
        InternalCalendarEventType[] | undefined
    >();

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

            <div className={style.Page}>
                <CalenderDays daysWithEvent={daysWithEvents} />

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

    console.log(daysWithEvent);

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

                                        d === selectedDay?.date() &&
                                            !OOB &&
                                            style.selected,

                                        daysWithEvent.has(d) && style.hasEvent
                                    )}
                                    onClick={() => {
                                        setSelectedDay(
                                            dayjs(new Date(year, month, d))
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
