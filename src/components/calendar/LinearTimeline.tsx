import { CalendarEventType } from './types';
import moment from 'moment';
import style from './LinearTimeline.module.css';
import { CSSProperties, Fragment, useRef, useState } from 'react';
import { groupEventsByDay } from './MonthCalendarShared';
export function LinearTimeline({
    events,
    styles,
}: {
    events: CalendarEventType[];
    styles: CSSProperties;
}) {
    const eventsGroupedByDay = groupEventsByDay(events);

    return (
        <div className={style.timelineContainer}>
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
        <div className={style.timelineHeader}>
            {date.format('MMM DD, dddd')}
        </div>
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
                <span>{moment(event.startTime).format('LT')}</span>
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
