'use client';
import { Calendar } from '@/components/ui/calendar';
import { CalendarEventType } from './types';
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import style from './MobileMonthCalendar.module.css';
import { useAtom } from 'jotai';
import {
  getEventsOfMonth,
  selectedDayAtom,
  yearMonthDay,
} from './MonthCalendarShared';

import './MobileMonthCalendar.css';
import { LinearTimeline } from './LinearTimeline';

export function MobileMonthCalendar({
  events,
}: {
  events: CalendarEventType[];
}) {
  const [[year, month], setYearMonth] = useState([
    moment().year(),
    moment().month(),
  ]);
  const [currMonth] = useMemo(() => [moment({ year, month })], [year, month]);

  const [selectedDay, setSelectedDay] = useAtom(selectedDayAtom);

  const timelineRef = useRef<HTMLDivElement>(null);

  const [maxHeight, setMaxHeight] = useState(0);

  const filteredEvents = useMemo(
    () => getEventsOfMonth(events, month, year),
    [year, month]
  );

  useEffect(() => {
    console.log('bleh', timelineRef.current);

    if (timelineRef.current) {
      setMaxHeight(window.innerHeight - timelineRef.current!.offsetTop);
    }
  }, [timelineRef.current]);

  return (
    <div
      className={style.calendarContainer}
      ref={timelineRef}
      style={
        {
          '--maxHeight': `${maxHeight}px`,
          overflow: 'hidden',
        } as CSSProperties
      }
    >
      <Calendar
        style={{
          width: 'min-content',
        }}
        defaultMonth={currMonth.toDate()}
        modifiers={{
          hasEvent: filteredEvents.map((e) => e.startTime),
        }}
        modifiersClassNames={{
          hasEvent: 'hasEvent',
        }}
        selected={selectedDay?.toDate()}
        onDayClick={(d, a, e) => {
          if (!moment(d).isSame(selectedDay, 'date')) {
            setSelectedDay(yearMonthDay(moment(d)));
          } else {
            setSelectedDay(undefined);
          }
        }}
        onMonthChange={(m) => {
          setYearMonth([m.getFullYear(), m.getMonth()]);
        }}
      />

      <LinearTimeline events={filteredEvents} />
    </div>
  );
}
