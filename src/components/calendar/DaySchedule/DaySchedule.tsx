'use client';

import { CSSProperties, useMemo, useRef, useState } from 'react';
import style from './DaySchedule.module.css';
import {
    currentTimeAtom,
    groupEventsByDay,
    InternalCalendarEventType,
    selectedEventAtom,
} from '../MonthCalendarShared';
import dayjs, { Dayjs } from 'dayjs';
import { useAtomValue, useSetAtom } from 'jotai';

/**
 * TODO
 * add callbacks or atoms etc etc for selected CalendarEvents or other "events"
 * @param param0
 * @returns
 */
export function DaySchedule({
    events,
    startDate,
    days,
    minColumnWidth,
}: {
    events: InternalCalendarEventType[];
    startDate: Dayjs;
    days: number;
    minColumnWidth: number;
}) {
    const endDate = startDate.clone().add(days, 'day').endOf('day');

    const processedEvents = useMemo(() => {
        return ProcessEventsForSchedule(
            groupEventsByDay(
                events.filter((item) => {
                    const startTime = item.startTime;
                    return (
                        startTime.isAfter(startDate) &&
                        startTime.isBefore(endDate)
                    );
                }),
                'timestamp'
            )
        );
    }, [events]);

    const selectedEvent = useAtomValue(selectedEventAtom);

    const [rowHeight, headerHeight] = [60, 24];

    const [containerHeight, setContainerHeight] = useState(0);
    const currentTime = useAtomValue(currentTimeAtom);

    let zero = dayjs().hour(0);
    return (
        <>
            <h1>Selected event: {selectedEvent?.event.title}</h1>
            <div
                className={style.scheduleRootWrapper}
                style={
                    {
                        '--rowHeight': `${rowHeight}px`,
                        '--minColWidth': `${minColumnWidth}px`,
                    } as CSSProperties
                }
            >
                <div className={style.scheduleRoot}>
                    <div
                        ref={(ref) => {
                            setContainerHeight(
                                ref?.scrollHeight! - headerHeight
                            );
                        }}
                        className={style.scheduleContainer}
                    >
                        <div className={style.timeColumn}>
                            <div className={style.header} />
                            {[...Array(24).keys()].map((idx) => {
                                const timeLabel = zero.format('h a'); //5 am
                                zero = zero.add(1, 'hour');
                                return (
                                    <div key={idx} className={style.timeLabel}>
                                        {timeLabel}
                                    </div>
                                );
                            })}
                        </div>

                        {Object.entries(processedEvents).map((item, index) => {
                            const [epochTimeString, columnsOfDay] = item;
                            const day = dayjs(parseInt(epochTimeString));
                            return (
                                <div
                                    key={`${epochTimeString}_${index}`}
                                    className={style.dayColumn}
                                >
                                    <div className={style.header}>
                                        {day.format('MMM D, ddd')}
                                    </div>
                                    <div className={style.dayColumnContent}>
                                        {containerHeight > 0 &&
                                            day.isSame(currentTime, 'day') && (
                                                <TimelineMarker
                                                    parentHeight={
                                                        containerHeight
                                                    }
                                                ></TimelineMarker>
                                            )}

                                        {containerHeight > 0 &&
                                            columnsOfDay.map((col, index) => (
                                                <div
                                                    key={index}
                                                    className={
                                                        style.dayEventColumn
                                                    }
                                                >
                                                    {col.map((event) => (
                                                        <DayEventItem
                                                            key={event.id}
                                                            event={event}
                                                            parentHeight={
                                                                containerHeight
                                                            }
                                                        ></DayEventItem>
                                                    ))}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

/**
 * * takes in events grouped by days, sorted by time.
 * * puts events in "columns" such that visually no events overlap
 * @param events
 */
function ProcessEventsForSchedule(eventsMaps: {
    [id: number]: InternalCalendarEventType[];
}) {
    const out: { [id: string]: InternalCalendarEventType[][] } = {};

    const events = Object.values(eventsMaps);
    const eventTimes = Object.keys(eventsMaps);
    for (let i = 0; i < events.length; i++) {
        const eventsOfDay = events[i];
        if (eventsOfDay.length === 0) {
            continue;
        }

        const columns: InternalCalendarEventType[][] = [
            [eventsOfDay.splice(0, 1)[0]],
        ];

        for (let e of eventsOfDay) {
            // handle the case when event runs past midnight
            const eventTime = e.startTime;
            if (
                !eventTime.add(e.duration, 'minute').isSame(eventTime, 'date')
            ) {
                // if end of the event is not the same day
                const minutesToMidnight = eventTime
                    .endOf('day')
                    .diff(eventTime, 'minute');
                const minutesAfterMidnight = e.duration - minutesToMidnight;

                if (minutesAfterMidnight > 5) {
                    // only handle it as overnight event the the day 2 component is long enough
                    if (i < events.length - 1) {
                        // if we are already looking at the last day, dont make it extend to day after
                        const nextevent = { ...e };
                        nextevent.startTime = eventTime
                            .add(1, 'day')
                            .startOf('day');
                        nextevent.duration = minutesAfterMidnight;

                        // hand off the later half of the event to the next day
                        events[i + 1] = [nextevent, ...events[i + 1]];
                    }

                    // crop the current event so it doesn't cross midnight
                    e.duration = minutesToMidnight;
                }
            }

            let inserted = false;
            for (const element of columns) {
                const c = element;
                const lastEvent = c.at(-1);
                const lastEventTime = lastEvent?.startTime.add(
                    lastEvent?.duration!,
                    'minute'
                );

                if (!eventTime.isBefore(lastEventTime)) {
                    //current event does not overlap last event of this column
                    inserted = true;
                    c.push(e);
                    break;
                }
            }

            if (!inserted) {
                // none of the exisitng columns can fit this event
                // make a new column then
                columns.push([e]);
            }
        }
        out[eventTimes[i]] = columns;
    }

    return out;
}

function DayEventItem({
    event,
    parentHeight,
}: {
    event: InternalCalendarEventType;
    parentHeight: number;
}) {
    const minutesInDay = 1440;
    const [top, height] = useMemo(() => {
        const minutesAtStart =
            event.startTime.hour() * 60 + event.startTime.minute();

        return [
            (minutesAtStart / minutesInDay) * parentHeight,
            (event.duration / minutesInDay) * parentHeight,
        ];
    }, [parentHeight]);

    const setSelectedEvent = useSetAtom(selectedEventAtom);

    const eventTime = event.startTime;

    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            className={style.dayEvent}
            onClick={() => {
                setSelectedEvent({
                    element: containerRef.current ?? undefined,
                    event,
                });
            }}
            style={
                {
                    '--top': `${Math.round(top)}px`,
                    '--height': `${Math.round(height)}px`,
                    '--color': event.color,
                } as CSSProperties
            }
        >
            <span>{event.title}</span>
            <span>
                {eventTime.format('h:mm A')} -{' '}
                {eventTime.add(event.duration, 'minutes').format('h:mm A')}
            </span>
        </div>
    );
}

function TimelineMarker({ parentHeight }: { parentHeight: number }) {
    const currentTime = useAtomValue(currentTimeAtom);

    const minutesInDay = 1440;
    const top = useMemo(() => {
        return (
            ((currentTime.hour() * 60 + currentTime.minute()) / minutesInDay) *
            parentHeight
        );
    }, [currentTime]);

    return (
        <div
            style={
                {
                    '--top': `${Math.round(top)}px`,
                } as CSSProperties
            }
            className={style.timeMarker}
        ></div>
    );
}
