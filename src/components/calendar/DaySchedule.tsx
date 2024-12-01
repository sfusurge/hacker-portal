'use client';

import { CalendarEventType } from './types';
import { useMemo } from 'react';
import style from './DaySchedule.module.css';
import { groupEventsByDay } from './MonthCalendarShared';
import dayjs, { Dayjs } from 'dayjs';

export function DaySchedule({
    events,
    startDate,
    days,
    minColumnWidth,
}: {
    events: CalendarEventType[];
    startDate: Dayjs;
    days: number;
    minColumnWidth: number;
}) {
    const endDate = startDate.clone().add(days, 'day').endOf('day');

    const eventGroupByDay = useMemo(() => {
        return groupEventsByDay(
            events.filter((item) => {
                const startTime = dayjs(item.startTime);
                console.log(
                    startTime.format('LLL'),
                    startDate.format('LLL'),
                    endDate.format('LLL')
                );

                return (
                    startTime.isAfter(startDate) && startTime.isBefore(endDate)
                );
            })
        );
    }, [events]);

    let zero = dayjs().hour(0);
    console.log(eventGroupByDay);

    return (
        <div className={style.scheduleRootWrapper}>
            <div className={style.scheduleRoot}>
                <div className={style.scheduleContainer}>
                    <div className={style.timeColumn}>
                        <div className={style.header} />
                        {[...Array(24).keys()].map((idx) => {
                            const timeLabel = zero.format('h a'); //5 am
                            zero = zero.add(1, 'hour');
                            return (
                                <div key={idx} className={style.timeLabel}>
                                    {timeLabel}
                                </div>
                            );
                        })}
                    </div>

                    {Object.values(eventGroupByDay).map((eventsOfDay) => (
                        <div className={style.dayColumn}>
                            <div className={style.header}></div>
                            <div className={style.dayColumnContent}>
                                blah blah
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
