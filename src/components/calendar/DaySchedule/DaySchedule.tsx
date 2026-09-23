'use client';

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import style from './DaySchedule.module.css';
import {
    currentTimeAtom,
    editModeAtom,
    groupEventsByDay,
    InternalCalendarEventType,
    selectedEventAtom,
} from '../MonthCalendarShared';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom, useAtomValue } from 'jotai';
import { AnimatePresence } from 'motion/react';
import { LongDescriptionModal } from '../EventLongDescription/EventLongDescription';
import clsx from 'clsx';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DateControls } from '@/components/calendar/DateControls/DateControls';
import { EventType } from '@/db/schema/events';
import {
    BoltIcon,
    BookOpenIcon,
    FaceSmileIcon,
} from '@heroicons/react/24/solid';
import { trpc } from '@/trpc/client';

// size of UI, shared
const [rowHeight, headerHeight, timeColumnWidth] = [90, 34, 50];

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
    maxVisibleColumns,
    showControls = true,
    onPreviousRange,
    onToday,
    onNextRange,
    onEventRsvpChange,
    isAdmin = false,
}: {
    startDate: Dayjs;
    days: number;
    minColumnWidth?: number;
    maxVisibleColumns?: number;
    showControls?: boolean;
    isAdmin?: boolean;
    onPreviousRange?: () => void;
    onToday?: () => void;
    onNextRange?: () => void;
    onEventRsvpChange?: () => void | Promise<void>;
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

    const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
    const [editMode, setEditMode] = useAtom(editModeAtom);
    const rsvpEvent = trpc.events.rsvpEvent.useMutation();

    const [containerHeight, setContainerHeight] = useState(0);

    const columnWidths = useMemo(() => {
        return Object.values(processedEvents).map((dayEventsCols) => {
            return Math.max(dayEventsCols.length * 100, minColumnWidth ?? 200);
        });
    }, [minColumnWidth, processedEvents]);

    const scheduleContentWidth = useMemo(() => {
        if (!maxVisibleColumns || days <= maxVisibleColumns) {
            return '100%';
        }

        const widthRatio = days / maxVisibleColumns;
        const timeColumnOffset = (widthRatio - 1) * timeColumnWidth;

        return `calc(${widthRatio * 100}% - ${timeColumnOffset}px)`;
    }, [days, maxVisibleColumns]);

    let zero = dayjs().hour(0);

    const timeLabelColumn = useMemo(() => {
        const diff = dayjs().startOf('day').diff(startDate, 'day');
        if (diff >= 0 && diff < days) {
            return diff;
        }
        return days - 1;
    }, [startDate]);

    const canRsvpSelectedEvent =
        selectedEvent?.event &&
        canRsvpEvent(selectedEvent.event) &&
        !selectedEvent.event.rsvped &&
        !isAdmin;

    const addSelectedEventToSchedule = async () => {
        if (!selectedEvent?.event) {
            return;
        }

        const event = selectedEvent.event;

        await rsvpEvent.mutateAsync({ eventId: event.id });

        setSelectedEvent({
            ...selectedEvent,
            event: {
                ...event,
                rsvped: true,
            },
        });

        await onEventRsvpChange?.();
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                height: '100%',
                position: 'relative',
                width: '100%',
            }}
        >
            <AnimatePresence>
                {selectedEvent?.event && !editMode && (
                    <LongDescriptionModal
                        event={selectedEvent.event}
                        isAdmin={isAdmin}
                        onClose={() => {
                            setSelectedEvent(undefined);
                        }}
                        onAddToSchedule={
                            canRsvpSelectedEvent
                                ? addSelectedEventToSchedule
                                : undefined
                        }
                        addToScheduleDisabled={rsvpEvent.isPending}
                        onEditEvent={
                            isAdmin
                                ? () => {
                                      setEditMode(true);
                                  }
                                : undefined
                        }
                        onEventDeleted={
                            isAdmin
                                ? async () => {
                                      await onEventRsvpChange?.();
                                  }
                                : undefined
                        }
                    />
                )}
            </AnimatePresence>

            <div
                className={style.scheduleRootWrapper}
                style={
                    {
                        '--rowHeight': `${rowHeight}px`,
                        '--headerHeight': `${headerHeight}px`,
                        '--timeColumnWidth': `${timeColumnWidth}px`,
                        '--scheduleContentWidth': scheduleContentWidth,
                    } as CSSProperties
                }
            >
                <div
                    className={clsx(
                        style.scheduleRoot,
                        maxVisibleColumns && style.hiddenScrollbar
                    )}
                >
                    <div
                        ref={(ref) => {
                            setContainerHeight(
                                ref?.scrollHeight! - headerHeight
                            );
                        }}
                        className={clsx(
                            style.scheduleContainer,
                            maxVisibleColumns && style.fixedVisibleColumns
                        )}
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
                                const timeLabel = zero.format('h A'); //5 AM
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
                                            {day.format('ddd D')}
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
                                                            dayColumns={
                                                                columnsOfDay
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
            {showControls && (
                <div className={style.scheduleControls}>
                    <ToggleGroup
                        type="single"
                        defaultValue="week"
                        className="h-8"
                    >
                        <ToggleGroupItem
                            value="week"
                            size="sm"
                            className="rounded-l-md px-3"
                        >
                            Week
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="event"
                            size="sm"
                            className="rounded-r-md px-3"
                        >
                            Event
                        </ToggleGroupItem>
                    </ToggleGroup>
                    <DateControls
                        onPrevious={onPreviousRange}
                        onToday={onToday}
                        onNext={onNextRange}
                    />
                </div>
            )}
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
    dayColumns,
    columnIndex,
}: {
    event: InternalCalendarEventType;
    parentHeight: number;
    dayColumns: InternalCalendarEventType[][];
    columnIndex: number;
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
    const eventEndTime = eventTime.add(event.duration, 'minute');
    const overlappingColumnIndexes = dayColumns
        .map((column, index) => {
            const hasOverlap =
                index === columnIndex ||
                column.some((otherEvent) => {
                    if (otherEvent === event) {
                        return false;
                    }

                    const otherEventEndTime = otherEvent.startTime.add(
                        otherEvent.duration,
                        'minute'
                    );

                    return (
                        eventTime.isBefore(otherEventEndTime) &&
                        otherEvent.startTime.isBefore(eventEndTime)
                    );
                });

            return hasOverlap ? index : -1;
        })
        .filter((index) => index >= 0);
    const overlapColumnCount = overlappingColumnIndexes.length;
    const overlapColumnIndex = Math.max(
        0,
        overlappingColumnIndexes.indexOf(columnIndex)
    );
    const isOverlapping = overlapColumnCount > 1;
    const isCompact = height < 64;
    const overlapWidth = isOverlapping ? 65 : 100;
    const overlapLeft =
        isOverlapping && overlapColumnCount > 1
            ? ((100 - overlapWidth) * overlapColumnIndex) /
              (overlapColumnCount - 1)
            : 0;
    const showMeta = height >= 40;
    const showLocation = event.location && !isOverlapping && !isCompact;
    const isRsvpEvent = canRsvpEvent(event);
    const isDeadlineEvent = event.eventType === EventType.DEADLINE;
    const Icon =
        event.eventType === EventType.WORKSHOP
            ? BookOpenIcon
            : event.eventType === EventType.ACTIVITY
              ? FaceSmileIcon
              : BoltIcon;

    const containerRef = useRef<HTMLDivElement>(null);

    const isActive = useMemo(() => {
        return selectedEvent?.event.id === event.id;
    }, [event.id, selectedEvent]);

    return (
        <div
            ref={containerRef}
            className={clsx([
                style.dayEvent,
                isRsvpEvent ? style.dayEventRsvped : style.dayEventStandard,
                isRsvpEvent && !event.rsvped && style.dayEventNeedsRsvp,
                isDeadlineEvent && style.dayEventDeadline,
                isCompact && style.dayEventCompact,
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
                    '--left': `${overlapLeft}%`,
                    '--width': `${overlapWidth}%`,
                    '--dayEventZIndex': columnIndex + 1,
                } as CSSProperties
            }
        >
            <div className={style.dayEventContent}>
                <span className={clsx(style.dayEventLine, style.dayEventTitle)}>
                    {event.title}
                </span>
                {showMeta && (
                    <span
                        className={clsx(style.dayEventLine, style.dayEventMeta)}
                    >
                        <Icon className={style.dayEventIcon} />
                        <span className={style.dayEventMetaText}>
                            {`${eventTime.format('h:mm A')} - ${eventEndTime.format('h:mm A')}`}
                            {showLocation && ` · ${event.location}`}
                        </span>
                    </span>
                )}
            </div>
        </div>
    );
}

function canRsvpEvent(event: InternalCalendarEventType) {
    return (
        event.eventType === EventType.WORKSHOP ||
        event.eventType === EventType.ACTIVITY
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
