'use client';

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import style from './DaySchedule.module.css';
import {
    currentTimeAtom,
    groupEventsByDay,
    InternalCalendarEventType,
    selectedEventAtom,
} from '../MonthCalendarShared';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom, useAtomValue } from 'jotai';
import { DynamicMessage } from '../DynamicMessage/DynamicMessage';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import { EventCard } from '../EventCard/EventCard';
import { AnimatePresence } from 'motion/react';
import { LongDescriptionModal } from '../EventLongDescription/EventLongDescription';
import clsx from 'clsx';

// size of UI, shared
const [rowHeight, headerHeight] = [90, 30];

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
    startDate: Dayjs;
    days: number;
    minColumnWidth?: number;
    events: InternalCalendarEventType[];
}) {
    startDate = dayjs(startDate);
    const endDate = startDate.add(Math.max(0, days - 1), 'day').endOf('day');

    const processedEvents = useMemo(() => {
        return ProcessEventsForSchedule(
            groupEventsByDay(
                events.filter((item) => {
                    const startTime = item.startTime;
                    return (
                        startTime.isAfter(startDate.startOf('day')) &&
                        startTime.isBefore(endDate.endOf('day'))
                    );
                }),
                dayjs(new Date(startDate.year(), startDate.month(), 1)),
                startDate,
                days
            )
        );
    }, [events, startDate, days]);

    const rootRef = useRef<HTMLDivElement>(null);
    const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);

    const [containerHeight, setContainerHeight] = useState(0);

    const [showMore, setShowMore] = useState(false);

    const columnWidths = useMemo(() => {
        return Object.values(processedEvents).map((dayEventsCols) => {
            return Math.max(dayEventsCols.length * 100, minColumnWidth ?? 200);
        });
    }, [processedEvents]);

    let zero = dayjs().hour(0);

    const timeLabelColumn = useMemo(() => {
        const diff = dayjs().startOf('day').diff(startDate, 'day');
        if (diff >= 0 && diff < days) {
            return diff;
        }
        return days - 1;
    }, [startDate]);

    return (
        <div
            style={{
                height: '100%',
                position: 'relative',
            }}
            ref={rootRef}
        >
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
                            {selectedEvent.event.hasLongDescription && (
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
                            )}
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
                        '--headerHeight': `${headerHeight}px`,
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
                                    style={
                                        {
                                            '--minColWidth': `${columnWidths[index]}px`,
                                        } as CSSProperties
                                    }
                                >
                                    <div
                                        className={style.header}
                                        style={
                                            {
                                                '--headerHeight': `${headerHeight}px`,
                                            } as CSSProperties
                                        }
                                    >
                                        <div className={style.headerContent}>
                                            {day.format('MMM D, ddd')}
                                        </div>
                                    </div>
                                    <div className={style.dayColumnContent}>
                                        {containerHeight > 0 &&
                                            index == timeLabelColumn && (
                                                <TimelineMarker
                                                    startDate={startDate}
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
                                                            columnCount={
                                                                columnsOfDay.length
                                                            }
                                                            columnIndex={index}
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
            out[eventTimes[i]] = [];
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
    columnIndex,
    columnCount,
}: {
    event: InternalCalendarEventType;
    parentHeight: number;
    columnIndex: number;
    columnCount: number;
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

    const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);

    const eventTime = event.startTime;

    const containerRef = useRef<HTMLDivElement>(null);

    const isActive = useMemo(() => {
        return selectedEvent?.event === event;
    }, [selectedEvent]);

    return (
        <div
            ref={containerRef}
            className={clsx([
                style.dayEvent,
                {
                    [style.active]: isActive,
                },
            ])}
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
                    '--col': columnIndex,
                    '--colCount': columnCount,
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

function TimelineMarker({
    parentHeight,
    startDate,
}: {
    parentHeight: number;
    startDate: Dayjs;
}) {
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
        function updateTime() {
            setCurrentTime(dayjs());

            if (currentTime.isBefore(startDate)) {
                getScrollParent(markerRef.current!)?.scrollTo({
                    top: top - 300,
                    behavior: 'smooth',
                });
            } else {
                markerRef.current!.scrollIntoView({
                    block: 'center', // vertical
                    inline: 'center', // horizontal
                    behavior: 'smooth',
                });
            }
        }
        const interval = setInterval(updateTime, 60000);
        setCurrentTime(dayjs());

        setTimeout(() => {
            updateTime();
        }, 100);

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

function getScrollParent(node: HTMLElement | null) {
    if (node == null) {
        return null;
    }

    const parent = node.parentNode as HTMLElement;

    if (parent.scrollHeight > parent.clientHeight) {
        return parent;
    } else {
        return getScrollParent(parent as HTMLElement);
    }
}
