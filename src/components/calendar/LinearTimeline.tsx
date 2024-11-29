import { CalendarEventType } from './types';
import moment from 'moment';
import style from './LinearTimeline.module.css';
import { CSSProperties, Fragment } from 'react';
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
                onClick={() => {
                    console.log('event clicked', event.title);
                }}
            >
                <span>{event.title}</span>
                <span>{moment(event.startTime).format('LT')}</span>
            </div>
        </div>
    );
}
