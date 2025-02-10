import { Dayjs } from 'dayjs';
import { array, number, string, z } from 'zod';

export const CalendarEvent = z.object({
    id: number().nonnegative().int(), // 0 or more
    title: string().min(1),
    description: string(),
    startTime: z.coerce.date(),
    duration: z.number().nonnegative(), // in minutes
    color: z.string(), // background color
    location: z.string().optional(),
});

export type CalendarEventType = z.infer<typeof CalendarEvent>;

export interface MonthInfoType {
    year: number;
    month: number;
    displayName: string;
    daysInMonth: number;
    firstDayOffset: number;
    weeksInMonth: number;
    weekdayNames: string[];
    firstDay: Dayjs;
}
