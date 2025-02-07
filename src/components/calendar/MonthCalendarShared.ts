'use client';
import { atom, useAtom } from 'jotai';
import { CalendarEventType } from './types';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/en-ca';
dayjs.locale('en-ca'); // use canadian locale, always.

// ===== start atoms =====
export const selectedDayAtom = atom<Dayjs | undefined>(undefined);

export interface SelectedEventInfo {
    event: InternalCalendarEventType;
    element: HTMLDivElement | undefined;
}
export const selectedEventAtom = atom<SelectedEventInfo | undefined>(undefined);
const _currentYearMonth = atom({
    year: dayjs().year(),
    month: dayjs().month(), // 0 index month
});

export const currentYearMonthAtom = atom(
    (get) => {
        return get(_currentYearMonth);
    },
    (
        get,
        set,
        changeType: '+1 month' | '-1 month' | 'set',
        newVal: { year: number; month: number }
    ) => {
        const oldVal = get(_currentYearMonth);
        if (changeType === '+1 month') {
            set(_currentYearMonth, {
                year: oldVal.year + (oldVal.month === 11 ? 1 : 0), // increment year if its already end of year
                month: (oldVal.month + 1) % 12,
            });
        } else if (changeType === '-1 month') {
            set(_currentYearMonth, {
                year: oldVal.year - (oldVal.month === 0 ? 1 : 0), // increment year if its already end of year
                month: (oldVal.month - 1) % 12,
            });
        } else if (changeType === 'set') {
            set(_currentYearMonth, newVal);
        }
    }
);

// FIXME: just testing with Dec 8th for now
export const currentTimeAtom = atom<Dayjs>(
    dayjs(new Date(2024, 11, 8, 14, 33))
);

// ===== end atoms =====

// ===== utils =====

export function groupEventsByDay(
    events: InternalCalendarEventType[],
    idxType: 'timestamp' | 'date' = 'date'
) {
    const grouped = {
        ...Object.groupBy(events, (item) => {
            if (idxType === 'date') {
                return item.startTime.date();
            } else {
                return item.startTime.startOf('day').unix();
            }
        }),
    } as { [dayOfMonth: number]: InternalCalendarEventType[] };

    for (const [key, val] of Object.entries(grouped)) {
        val.sort((a, b) => {
            return a.startTime.unix() - b.startTime.unix();
        });
        grouped[parseInt(key)] = val;
    }
    console.log({ ...grouped });

    return grouped;
}

export function getEventsOfMonth(
    events: InternalCalendarEventType[],
    month: number,
    year: number
) {
    const filtered = events.filter((item) => {
        const start = item.startTime;
        const end = item.startTime.add(item.duration, 'minute');

        return start.month() == month && start.year() == year;
    });

    return filtered;
}

export function timeBetween(target: Dayjs, start: Dayjs, end: Dayjs) {
    return target.isAfter(start) && target.isBefore(end);
}

export function yearMonthDay(d: Dayjs) {
    return dayjs(new Date(d.year(), d.month(), d.date()));
}

export type InternalCalendarEventType = Omit<CalendarEventType, 'startTime'> & {
    startTime: Dayjs;
    endTime: Dayjs;
};
export function DayjsifyEvents(
    events: CalendarEventType[]
): InternalCalendarEventType[] {
    return events.map((e) => {
        return {
            ...e,
            startTime: dayjs(e.startTime),
            endTime: dayjs(e.startTime).add(e.duration, 'minute'),
        };
    });
}
