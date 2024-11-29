'use client';
import { atom, useAtom } from 'jotai';
import { CalendarEventType } from './types';
import moment, { Moment } from 'moment';

// states to be used by MonthCalendar Component and its children
export const selectedDay = atom(1);

export interface SelectedEventInfo {
    event: CalendarEventType;
    element: HTMLDivElement;
}
export const selectedEventAtom = atom<SelectedEventInfo | undefined>(undefined);

export function groupEventsByDay(events: CalendarEventType[]) {
    const grouped = {
        ...Object.groupBy(events, (item) => {
            return moment(item.startTime).date();
        }),
    } as { [dayOfMonth: number]: CalendarEventType[] };

    for (const [key, val] of Object.entries(grouped)) {
        val.sort((a, b) => {
            return a.title.localeCompare(b.title);
        });
        grouped[parseInt(key)] = val;
    }
    return grouped;
}

export function getEventsOfMonth(
    events: CalendarEventType[],
    month: number,
    year: number
) {
    const filtered = events.filter((item) => {
        const start = moment(item.startTime);
        const end = moment(item.startTime).minutes(item.duration);

        return start.month() == month && start.year() == year;
    });

    return filtered;
}

export function timeBetween(
    target: Date | Moment,
    start: Date | Moment,
    duration: number
) {
    target = moment(target);
    start = moment(start);

    return target.isAfter(start) && target.isBefore(start.minutes(duration));
}
