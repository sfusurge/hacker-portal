import { CalendarEventType } from './types';
import moment, { Moment } from 'moment';
import style from './LinearTimeline.module.css';
import { CSSProperties, Fragment, useEffect, useRef, useState } from 'react';
import { groupEventsByDay, timeBetween } from './MonthCalendarShared';
import { atom, Provider, useAtom, useAtomValue, useSetAtom } from 'jotai';

const DATE_FORMAT = 'MMM DD, dddd';
const currentTimeAtom = atom(moment());
const selectedDay = atom<string | undefined>(undefined);

export function LinearTimeline({
    events,
    styles,
}: {
    events: CalendarEventType[];
    styles: CSSProperties;
}) {
    return (
        <Provider>
            <_LinearTimeline events={events} styles={styles}></_LinearTimeline>
        </Provider>
    );
}

function _LinearTimeline({
    events,
    styles,
}: {
    events: CalendarEventType[];
    styles: CSSProperties;
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
        <div className={style.timelineContainer}>
            <span>Current time is: {currentTime.format('LTS')}</span>
            {Object.entries(eventsGroupedByDay).map((e) => {
                const [key, eventsOfDay] = e;
                return (
                    <div key={key} className={style.dayWrapper}>
                        <TimelineDateHeader
                            date={moment(eventsOfDay[0].startTime)}
                        ></TimelineDateHeader>
                        {eventsOfDay.map((item) => (
                            <TimelineItem
                                key={item.id}
                                event={item}
                            ></TimelineItem>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}

function TimelineDateHeader({ date }: { date: moment.Moment }) {
    return (
        <div className={style.timelineHeader}>{date.format(DATE_FORMAT)}</div>
    );
}

function TimelineItem({ event }: { event: CalendarEventType }) {
    const [contentHeight, setContentHeight] = useState(0);
    const innerContentRef = useRef<HTMLDivElement | null>(null);
    return (
        <div
            className={style.timelineItemWrapper}
            style={
                {
                    '--color': event.color,
                } as CSSProperties
            }
            onClick={() => {
                console.log('bleh');
            }}
        >
            <div
                className={style.timelineItemMainContent}
                onClick={() => {
                    if (contentHeight === 0) {
                        setContentHeight(
                            innerContentRef.current?.scrollHeight!
                        );
                    } else {
                        setContentHeight(0);
                    }
                }}
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
            {moment(event.startTime).format('LT')}
        </span>
    );
}
