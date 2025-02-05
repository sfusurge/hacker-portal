import { array, number, string, z } from 'zod';

export const CalendarEvent = z.object({
    id: number().nonnegative().int(), // 0 or more
    title: string().min(1),
    description: string(),
    startTime: z.coerce.date(),
    duration: z.number().nonnegative(), // in minutes
    color: z.string(), // background color
});

export type CalendarEventType = z.infer<typeof CalendarEvent>;

export const MonthInfo = z.object({
    // this object is used to store precomputed value about the current month to make rendering code cleaner
    year: number().int().min(2000).max(2099),
    month: number().int().min(1).max(12),
    displayName: string(),
    daysInMonth: number().int().min(28).max(31),
    firstDayOffset: number().min(0).max(6), // 0 means start on sunday, 6 means start on saturaday
    weeksInMonth: number().min(4).max(6), // how many rows does this month take on the calendar,
    weekdayNames: array(string()),
});

export type MonthInfoType = z.infer<typeof MonthInfo>;
