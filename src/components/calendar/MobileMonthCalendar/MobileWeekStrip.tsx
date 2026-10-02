'use client';

import clsx from 'clsx';
import type { Dayjs } from 'dayjs';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { range } from '@/components/calendar/MonthCalendarShared';
import style from './MobileCalendar.module.css';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MobileWeekStripProps {
    selectedDay: Dayjs;
    onSelectDay: (day: Dayjs) => void;
    daysWithEvents: Set<string>;
}

export function MobileWeekStrip({
    selectedDay,
    onSelectDay,
    daysWithEvents,
}: MobileWeekStripProps) {
    const weekStart = selectedDay.startOf('week');
    const days = range(7).map((i) => weekStart.add(i, 'day'));

    return (
        <div className="flex flex-col gap-2 px-3 pt-3 pb-2">
            <div className={style.monthIndicator}>
                <button
                    type="button"
                    aria-label="Previous week"
                    className={style.arrowButtons}
                    onClick={() => onSelectDay(selectedDay.subtract(1, 'week'))}
                >
                    <ChevronLeftIcon className="w-6" />
                </button>
                <span>{selectedDay.format('MMMM YYYY')}</span>
                <button
                    type="button"
                    aria-label="Next week"
                    className={style.arrowButtons}
                    onClick={() => onSelectDay(selectedDay.add(1, 'week'))}
                >
                    <ChevronRightIcon className="w-6" />
                </button>
            </div>

            <div className={style.DayRow}>
                {WEEKDAY_LABELS.map((label) => (
                    <span key={label} className={style.DayRowItem}>
                        {label}
                    </span>
                ))}
            </div>

            <div className={style.DateRow}>
                {days.map((day) => {
                    const key = day.format('YYYY-MM-DD');
                    const isSelected = day.isSame(selectedDay, 'day');

                    return (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={isSelected}
                            className={clsx(
                                style.DateButton,
                                isSelected && style.selected,
                                daysWithEvents.has(key) && style.hasEvent
                            )}
                            onClick={() => onSelectDay(day)}
                        >
                            {day.date()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
