import { CalendarEventType } from './types';
import moment, { Moment } from 'moment';
import style from './LinearTimeline.module.css';
import { CSSProperties, Fragment, useEffect, useRef, useState } from 'react';
import {
  groupEventsByDay,
  timeBetween,
  selectedDayAtom,
} from './MonthCalendarShared';
import { atom, Provider, useAtom, useAtomValue, useSetAtom } from 'jotai';

const DATE_FORMAT = 'MMM DD, dddd';
const currentTimeAtom = atom(moment());

export function LinearTimeline({
  events,
  styles,
}: Readonly<{
  events: CalendarEventType[];
  styles?: CSSProperties | undefined;
}>) {
  return <_LinearTimeline events={events} styles={styles}></_LinearTimeline>;
}

function _LinearTimeline({
  events,
  styles,
}: {
  events: CalendarEventType[];
  styles: CSSProperties | undefined;
}) {
  const eventsGroupedByDay = groupEventsByDay(events);

  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={style.timelineContainer} style={styles}>
      <span>Current time is: {currentTime.format('LTS')}</span>
      {Object.entries(eventsGroupedByDay).map((e) => {
        const [key, eventsOfDay] = e;

        return (
          <TimeLineDayWrapper
            key={key}
            eventsOfDay={eventsOfDay}
          ></TimeLineDayWrapper>
        );
      })}
    </div>
  );
}

function TimeLineDayWrapper({
  eventsOfDay,
}: {
  eventsOfDay: CalendarEventType[];
}) {
  const [_selectedDay, set_SelectedDay] = useAtom(selectedDayAtom);

  const tempDay = moment(eventsOfDay[0].startTime);
  const dayId = moment({
    year: tempDay.year(),
    month: tempDay.month(),
    day: tempDay.date(),
  });

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (_selectedDay?.isSame(dayId, 'date')) {
      ref.current!.parentElement!.scrollTo({
        behavior: 'smooth',
        top: ref.current!.offsetTop,
      });
    }
  }, [_selectedDay]);

  return (
    <div className={style.dayWrapper} ref={ref}>
      <div
        className={style.timelineHeader}
        onClick={() => {
          set_SelectedDay(dayId);
        }}
      >
        {moment(eventsOfDay[0].startTime).format(DATE_FORMAT)}
      </div>

      {eventsOfDay.map((item) => (
        <TimelineItem key={item.id} event={item}></TimelineItem>
      ))}
    </div>
  );
}

function TimelineItem({ event }: { event: CalendarEventType }) {
  const [contentHeight, setContentHeight] = useState(0);
  const innerContentRef = useRef<HTMLDivElement | null>(null);

  function expandContent() {
    if (contentHeight === 0) {
      setContentHeight(innerContentRef.current?.scrollHeight!);
    } else {
      setContentHeight(0);
    }
  }

  return (
    <div
      className={style.timelineItemWrapper}
      style={
        {
          '--color': event.color,
        } as CSSProperties
      }
    >
      <div
        className={style.timelineItemMainContent}
        onClick={expandContent}
        onKeyDown={(e) => {
          if (e.key == 'enter') {
            expandContent();
          }
        }}
        aria-expanded={contentHeight > 0}
      >
        <span>{event.title}</span>
        <TimeLabel event={event}></TimeLabel>
      </div>

      <div
        className={style.timelineItemMoreContent}
        style={{
          maxHeight: `${contentHeight}px`,
        }}
      >
        <div
          ref={innerContentRef}
          style={{
            padding: '0.5rem',
          }}
        >
          {event.description}
        </div>
      </div>
    </div>
  );
}

function TimeLabel({ event }: { event: CalendarEventType }) {
  const currentTime = useAtomValue(currentTimeAtom);

  return (
    <span>
      {timeBetween(currentTime, event.startTime, event.duration) ? '> ' : ''}
      {moment(event.startTime).format('LT')}
    </span>
  );
}
