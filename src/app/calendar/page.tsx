'use client';

import { CalendarEventType } from '@/components/calendar/types';
import { MonthCalendar } from '@/components/calendar/MonthCalendar';
import { useState } from 'react';

export default function Calendar() {
  const events: CalendarEventType[] = [];
  return (
    <div>
      <h1>Calendar Test page</h1>
      <MonthCalendar events={events}></MonthCalendar>
    </div>
  );
}
