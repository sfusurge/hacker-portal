'use client';
import { atom, useAtom } from 'jotai';
import { CalendarEventType } from './types';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/en-ca';
dayjs.locale('en-ca'); // use canadian locale, always.

export const selectedDayAtom = atom<Dayjs | undefined>(undefined);

export interface SelectedEventInfo {
    event: CalendarEventType;
    element: HTMLDivElement | undefined;
}
export const selectedEventAtom = atom<SelectedEventInfo | undefined>(undefined);

// FIXME: just testing with Dec 8th for now
export const currentTimeAtom = atom<Dayjs>(
    dayjs(new Date(2024, 11, 8, 14, 33))
);

export function groupEventsByDay(
    events: CalendarEventType[],
    idxType: 'timestamp' | 'date' = 'date'
) {
    const grouped = {
        ...Object.groupBy(events, (item) => {
            if (idxType === 'date') {
                return dayjs(item.startTime).date();
            } else {
                return dayjs(item.startTime).startOf('day').toDate().getTime();
            }
        }),
    } as { [dayOfMonth: number]: CalendarEventType[] };

    for (const [key, val] of Object.entries(grouped)) {
        val.sort((a, b) => {
            return a.startTime.getTime() - b.startTime.getTime();
        });
        grouped[parseInt(key)] = val;
    }
    console.log({ ...grouped });

    return grouped;
}

export function getEventsOfMonth(
    events: CalendarEventType[],
    month: number,
    year: number
) {
    const filtered = events.filter((item) => {
        const start = dayjs(item.startTime);
        const end = dayjs(item.startTime).add(item.duration, 'minute');

        return start.month() == month && start.year() == year;
    });

    return filtered;
}

export function timeBetween(
    target: Date | Dayjs,
    start: Date | Dayjs,
    duration: number
) {
    if (!dayjs.isDayjs(target)) {
        target = dayjs(target);
    }

    if (!dayjs.isDayjs(start)) {
        start = dayjs(start);
    }

    return (
        target.isAfter(start) && target.isBefore(start.add(duration, 'minute'))
    );
}

export function yearMonthDay(d: Dayjs) {
    return dayjs(new Date(d.year(), d.month(), d.date()));
}
