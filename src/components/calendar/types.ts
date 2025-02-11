import { Dayjs } from 'dayjs';
import { array, number, string, z } from 'zod';

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
