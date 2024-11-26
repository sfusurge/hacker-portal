import { atom, useAtom } from 'jotai';
import { CalendarEventType } from './types';

// states to be used by MonthCalendar Component and its children
export const selectedDay = atom(1);

export interface SelectedEventInfo {
  event: CalendarEventType;
  element: HTMLDivElement;
}
export const selectedEventAtom = atom<SelectedEventInfo | undefined>(undefined);
