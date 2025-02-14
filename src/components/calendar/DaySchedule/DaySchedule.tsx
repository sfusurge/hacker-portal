'use client';

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import style from './DaySchedule.module.css';
import {
    currentTimeAtom,
    DayjsifyEvents,
    groupEventsByDay,
    InternalCalendarEventType,
    selectedEventAtom,
} from '../MonthCalendarShared';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { DynamicMessage } from '../DynamicMessage/DynamicMessage';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import { EventCard } from '../EventCard/EventCard';
import { AnimatePresence } from 'motion/react';
import { LongDescriptionModal } from '../EventLongDescription/EventLongDescription';
import { CalendarEvent } from '@/server/routers/eventsRouter';

// size of UI, shared
const [rowHeight, headerHeight] = [90, 30];

/**
 * TODO
 * add callbacks or atoms etc etc for selected CalendarEvents or other "events"
 * @param param0
 * @returns
 */
export function DaySchedule({
    events: _events,
    startDate,
    days,
    minColumnWidth,
}: {
    events: CalendarEvent[];
    startDate: Dayjs;
    days: number;
    minColumnWidth: number;
}) {
    const endDate = startDate
        .clone()
        .add(Math.max(0, days - 1), 'day')
        .endOf('day');

    const events = useMemo(() => DayjsifyEvents(_events), [_events]);

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
                dayjs(new Date(startDate.year(), startDate.month(), 1))
            )
        );
    }, [events]);

    const rootRef = useRef<HTMLDivElement>(null);
    const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);

    const [containerHeight, setContainerHeight] = useState(0);
    const currentTime = useAtomValue(currentTimeAtom);

    const [showMore, setShowMore] = useState(false);

    let zero = dayjs().hour(0);
    return (
        <div
            style={{
                height: '100%',
            }}
        >
            <div
                ref={rootRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 0,
                    height: `${headerHeight}px`,
                }}
            >
                {/* spacer to provide reference position for dynamic message*/}
            </div>
            <AnimatePresence>
                {selectedEvent && selectedEvent.element && (
                    <DynamicMessage
                        rootRef={rootRef.current!}
                        parentRef={selectedEvent.element}
                        onClose={() => {
                            setSelectedEvent(undefined);
                        }}
                    >
                        <EventCard event={selectedEvent.event}>
                            <SkewmorphicButton
                                style={{
                                    backgroundColor: 'var(--brand-700)',
                                }}
                                onClick={() => {
                                    setShowMore(true);
                                }}
                            >
                                More Info
                            </SkewmorphicButton>
                        </EventCard>
                    </DynamicMessage>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedEvent && selectedEvent.element && showMore && (
                    <LongDescriptionModal
                        event={selectedEvent.event}
                        onClose={() => {
                            setShowMore(false);
                        }}
                    />
                )}
            </AnimatePresence>

            <div
                className={style.scheduleRootWrapper}
                style={
                    {
                        '--rowHeight': `${rowHeight}px`,
                        '--minColWidth': `${minColumnWidth}px`,
                        '--headerHeight': `${headerHeight}px`,
                    } as CSSProperties
                }
            >
                <div className={style.scheduleRoot}>
                    <div
                        ref={(ref) => {
                            console.log(ref?.scrollHeight!, headerHeight);
                            setContainerHeight(
                                ref?.scrollHeight! - headerHeight
                            );
                        }}
                        className={style.scheduleContainer}
                    >
                        <div className={style.timeColumn}>
                            <div
                                className={style.header}
                                style={
                                    {
                                        '--headerHeight': `${headerHeight}px`,
                                    } as CSSProperties
                                }
                            />
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
                            const day = startDate.add(index, 'day');
                            return (
                                <div
                                    key={`${epochTimeString}_${index}`}
                                    className={style.dayColumn}
                                >
                                    <div
                                        className={style.header}
                                        style={
                                            {
                                                '--headerHeight': `${headerHeight}px`,
                                            } as CSSProperties
                                        }
                                    >
                                        {day.format('MMM D, ddd')}
                                    </div>
                                    <div className={style.dayColumnContent}>
                                        {containerHeight > 0 &&
                                            (true ||
                                                day.isSame(
                                                    currentTime,
                                                    'day'
                                                )) && (
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
        </div>
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
    // no empty returns
    if (Object.keys(out).length === 0) {
        return { 0: [[]] };
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
            <div className={style.dayEventContent}>
                <span className={style.dayEventLine}>{event.title}</span>
                <span className={style.dayEventLine}>
                    {`${eventTime.format('h:mm A')} - ${eventTime.add(event.duration, 'minutes').format('h:mm A')}`}
                </span>
                {event.location && (
                    <span className={style.dayEventLine}>{event.location}</span>
                )}
            </div>
        </div>
    );
}

function TimelineMarker({ parentHeight }: { parentHeight: number }) {
    const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);

    const minutesInDay = 1440;
    const top = useMemo(() => {
        return (
            ((currentTime.hour() * 60 + currentTime.minute()) / minutesInDay) *
            parentHeight
        );
    }, [currentTime]);

    const markerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs());
        }, 60000);
        setCurrentTime(dayjs());
        markerRef.current!.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'center',
        });
        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div
            ref={markerRef}
            style={
                {
                    '--top': `${Math.round(top)}px`,
                } as CSSProperties
            }
            className={style.timeMarker}
        >
            <div className={style.timeText}>{currentTime.format('hh:mm')}</div>
        </div>
    );
}
