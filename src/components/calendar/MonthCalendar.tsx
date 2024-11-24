'use client';

import { CSSProperties, useMemo } from 'react';
import { CalendarEventType, MonthInfoType } from './types';
import moment from 'moment';
import style from './MonthCalendar.module.css';
moment.locale('en-CA'); // lock local to canada, no need to support calendar format aroudn the world

function getMonthInfo(year: number, month: number): MonthInfoType {
  const target = moment({
    year,
    month,
    day: 1,
  });

  return {
    month,
    year,
    daysInMonth: target.daysInMonth(),
    displayName: target.format('MMMM DD, YYYY'), // November 23, 2024
    firstDayOffset: target.day(), // day in week of the first day.
    weeksInMonth: Math.ceil((target.daysInMonth() + target.day()) / 7),
    weekdayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'],
  } as MonthInfoType;
}

function range(count: number) {
  const out = Array(count);

  for (let i = 0; i < count; i++) {
    out[i] = i;
  }

  return out;
}

export function MonthCalendar({ events }: { events: CalendarEventType[] }) {
  const [year, month] = [2024, 10]; // for testing, month is 0 indexed

  const monthInfo = useMemo(() => {
    return getMonthInfo(year, month);
  }, [year, month]);

  return (
    <div className="monthcalendar_parent">
      <h1>{monthInfo.displayName}</h1>

      <div
        className={style.calendarContainer}
        style={
          {
            '--rowCount': monthInfo.weeksInMonth,
          } as CSSProperties
        }
      >
        {/* Week day name row, such as Sun, Mon, Tues, ... */}
        <div className={style.weekdayNameRow}>
          {monthInfo.weekdayNames.map((item, index) => (
            <span key={index} className={style.weekdayName}>
              {item}
            </span>
          ))}
        </div>

        {/* Day in month, each row is a week as a flex row
                then each row contains items for each day.
            */}

        {range(monthInfo.weeksInMonth).map((weekIdx) => (
          <div key={weekIdx} className={style.monthDayRow}>
            {range(7).map((dayIdx) => (
              <MonthDay
                key={dayIdx}
                day={weekIdx * 7 + dayIdx + 1 - monthInfo.firstDayOffset}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthDay({ day }: { day: number }) {
  if (day <= 0) {
    return <div className={style.monthDayItem}></div>;
  }

  return <div className={style.monthDayItem}>{day}</div>;
}
