import { atom, useAtom } from 'jotai';
import { CalendarEventType } from './types';

// states to be used by MonthCalendar Component and its children
export const selectedDay = atom(1);
export const selectedEventAtom = atom<CalendarEventType | undefined>(undefined);
