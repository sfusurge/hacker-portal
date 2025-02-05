import { CalendarEventType } from './types';

import style from './LinearTimeline.module.css';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import {
    groupEventsByDay,
    timeBetween,
    selectedDayAtom,
    yearMonthDay,
} from './MonthCalendarShared';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import dayjs from 'dayjs';

const DATE_FORMAT = 'MMM DD, dddd';
const currentTimeAtom = atom(dayjs());

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

    const setCurrentTime = useSetAtom(currentTimeAtom);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs());
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div className={style.timelineContainer} style={styles}>
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

    const dayId = yearMonthDay(dayjs(eventsOfDay[0].startTime));

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
                {dayjs(eventsOfDay[0].startTime).format(DATE_FORMAT)}
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
            {timeBetween(currentTime, event.startTime, event.duration)
                ? '> '
                : ''}
            {dayjs(event.startTime).format('h:mm A')}
        </span>
    );
}
