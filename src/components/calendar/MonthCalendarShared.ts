'use client';
import { atom, useAtom } from 'jotai';

import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/en-ca';
import { CalendarEvent } from '@/server/routers/eventsRouter';
dayjs.locale('en-ca'); // use canadian locale, always.

// ===== start atoms =====
export const selectedDayAtom = atom<Dayjs | undefined>(undefined);

export interface SelectedEventInfo {
    event: InternalCalendarEventType;
    element: Node | undefined;
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
        newVal?: { year: number; month: number }
    ) => {
        const oldVal = get(_currentYearMonth);
        let date = dayjs(new Date(oldVal.year, oldVal.month, 1));
        if (changeType === '+1 month') {
            date = date.add(1, 'month');
            set(_currentYearMonth, {
                year: date.year(),
                month: date.month(),
            });
        } else if (changeType === '-1 month') {
            date = date.subtract(1, 'month');
            set(_currentYearMonth, {
                year: date.year(),
                month: date.month(),
            });
        } else if (changeType === 'set' && newVal) {
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
function groupBy<K extends PropertyKey, T>(
    items: Iterable<T>,
    keySelector: (item: T) => K
): Record<K, T[]> | {} {
    const out: Partial<Record<K, T[]>> = {};

    for (const item of items) {
        const id = keySelector(item);
        if (!out[id]) {
            out[id] = [item];
        } else {
            out[id].push(item);
        }
    }

    return out;
}

export function groupEventsByDay(
    events: InternalCalendarEventType[],
    firstDayOfMonth: Dayjs
) {
    const grouped = {
        ...groupBy(
            events,
            (item) =>
                Math.floor(item.startTime.diff(firstDayOfMonth, 'hour') / 24) +
                1
        ),
    };

    for (const [key, val] of Object.entries(grouped)) {
        val.sort((a, b) => {
            return a.startTime.unix() - b.startTime.unix();
        });
        grouped[parseInt(key)] = val;
    }

    return grouped;
}

export function getEventsOfMonth(
    events: InternalCalendarEventType[],
    month: number,
    year: number,
    inclusive: boolean = true
) {
    const filtered = events.filter((item) => {
        const start = item.startTime;
        if (inclusive) {
            return (
                (Math.abs(month - item.startTime.month()) <= 1 ||
                    month - item.startTime.month() === 11) &&
                Math.abs(year - start.year()) <= 1
            );
        } else {
            return item.startTime.month() === month;
        }
    });
    return filtered;
}

export function timeBetween(target: Dayjs, start: Dayjs, end: Dayjs) {
    return target.isAfter(start) && target.isBefore(end);
}

export function yearMonthDay(d: Dayjs) {
    return dayjs(new Date(d.year(), d.month(), d.date()));
}

export function weeksInMonth(firstDay: Dayjs) {
    return Math.ceil((firstDay.daysInMonth() + firstDay.day()) / 7);
}

function getHour(t: Dayjs) {
    if (t.minute() === 0) {
        return t.format('h A');
    } else {
        return t.format('h:mm A');
    }
}

export function getEventDurationString(event: InternalCalendarEventType) {
    return `${event.startTime.format('ddd, MMM D')} - ${getHour(event.startTime)} to ${getHour(event.endTime)}`;
}

export type InternalCalendarEventType = Omit<
    CalendarEvent,
    'startDate' | 'endDate'
> & {
    startTime: Dayjs;
    endTime: Dayjs;
    duration: number;
};

export function DayjsifyEvents(
    events: CalendarEvent[]
): InternalCalendarEventType[] {
    return events.map((e) => {
        const res = {
            ...e,
            startTime: dayjs(e.startDate),
            endTime: dayjs(e.endDate),
            duration: 0,
        };
        res.duration = Math.abs(
            Math.ceil(res.startTime.diff(res.endTime, 'minute'))
        );
        return res;
    });
}

// TODO remove debug code
export function getDebugLongDescription(eventId: string) {
    // gpt generated example event description
    return `
# 🚀 Hackathon Workshop: Build a Full-Stack App with Svelte & Firebase

Join us for an exciting hands-on workshop where you'll learn how to build a full-stack web application using **Svelte** and **Firebase**! Whether you're new to web development or looking to expand your tech stack, this workshop is perfect for you.

## 📅 Event Details
- **Date:** [Insert Date]
- **Time:** [Insert Time] (Local Time)
- **Location:** [Insert Location or Virtual Link]
- **Duration:** 2 hours
- **Difficulty Level:** Beginner to Intermediate

## 🛠 What You'll Learn
✅ Introduction to Svelte framework  
✅ Setting up Firebase for authentication & database  
✅ Building a responsive web app  
✅ Deploying your app live  

![Svelte Logo](https://upload.wikimedia.org/wikipedia/commons/1/1b/Svelte_Logo.svg)


## 🎯 Who Should Attend?
- Hackathon participants who want to build web apps quickly
- Developers curious about Svelte & Firebase
- Anyone interested in full-stack development

## 📌 Prerequisites
- Basic HTML, CSS, and JavaScript knowledge
- A laptop with Node.js installed
- A GitHub account (optional but recommended)

## 📝 Registration
Spots are limited! Register now at [Insert Registration Link]

![Hackathon Coding](https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/JavaScript-logo.png/500px-JavaScript-logo.png)


## 💡 About the Instructor
[Your Name] is a [Your Title] with experience in full-stack development and cloud technologies. Passionate about open-source and teaching, they have led numerous workshops on modern web frameworks.

---

🔗 Stay Connected: Follow us on [Insert Social Media Links] for updates!

#Hackathon #WebDevelopment #Svelte #Firebase
    `;
}
