'use client';

import { CSSProperties, useEffect, useMemo, useRef } from 'react';
import style from './DaySchedule.module.css';
import {
    currentTimeAtom,
    editModeAtom,
    canAddEventToSchedule,
    groupEventsByDay,
    InternalCalendarEventType,
    selectEventAtom,
    selectedEventAtom,
} from '../MonthCalendarShared';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence } from 'motion/react';
import { LongDescriptionModal } from '../EventLongDescription/EventLongDescription';
import clsx from 'clsx';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DateControls } from '@/components/calendar/DateControls/DateControls';
import { EventType } from '@/db/schema/events';
import { trpc } from '@/trpc/client';
import { getEventTypeDisplay } from '@/utils/eventTypeDisplay';

const [rowHeight, headerHeight, timeColumnWidth] = [90, 34, 50];
const splitThresholdMinutes = 15;
const cascadeIndent = 10;

export type ScheduleViewMode = 'week' | 'event';

type ScheduleLayoutItem = {
    event: InternalCalendarEventType;
    level: number;
    slot: number;
    slots: number;
    zIndex: number;
    visibleMinutes: number;
    overlapsBlock: boolean;
};

const minutesToPx = (minutes: number) => (minutes / 60) * rowHeight;
const minuteOfDay = (time: Dayjs) => time.hour() * 60 + time.minute();

export function DaySchedule({
    events,
    startDate,
    days,
    minColumnWidth = 200,
    maxVisibleColumns,
    showControls = true,
    onPreviousRange,
    onToday,
    onNextRange,
    onEventRsvpChange,
    viewMode = 'week',
    onViewModeChange,
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
    viewMode?: ScheduleViewMode;
    onViewModeChange?: (mode: ScheduleViewMode) => void;
    events: InternalCalendarEventType[];
}) {
    const processedEvents = useMemo(() => {
        const rangeStart = startDate.startOf('day');
        const rangeEnd = startDate
            .add(Math.max(0, days - 1), 'day')
            .endOf('day');

        return processEventsForSchedule(
            groupEventsByDay(
                events.filter(
                    ({ startTime }) =>
                        startTime.isAfter(rangeStart) &&
                        startTime.isBefore(rangeEnd)
                ),
                startDate.startOf('month'),
                startDate,
                days
            )
        );
    }, [events, startDate, days]);

    const selectedEvent = useAtomValue(selectedEventAtom);
    const selectEvent = useSetAtom(selectEventAtom);
    const [editMode, setEditMode] = useAtom(editModeAtom);
    const rsvpEvent = trpc.events.rsvpEvent.useMutation();
    const unrsvpEvent = trpc.events.unrsvpEvent.useMutation();
    const ignoreEvent = trpc.events.ignoreEvent.useMutation();

    const columnWidths = Object.values(processedEvents).map((items) =>
        Math.max(
            minColumnWidth,
            ...items.map(
                ({ level, slots }) => level * cascadeIndent + slots * 100
            )
        )
    );

    const widthRatio = maxVisibleColumns ? days / maxVisibleColumns : 1;
    const scheduleContentWidth =
        widthRatio > 1
            ? `calc(${widthRatio * 100}% - ${(widthRatio - 1) * timeColumnWidth}px)`
            : '100%';

    const todayIndex = dayjs().startOf('day').diff(startDate, 'day');
    const markerColumn =
        todayIndex >= 0 && todayIndex < days ? todayIndex : days - 1;

    const canScheduleSelectedEvent =
        selectedEvent?.event &&
        canAddEventToSchedule(selectedEvent.event) &&
        !isAdmin;

    const updateSelectedEvent = async (
        mutate: (eventId: number) => Promise<unknown>,
        patch: Pick<InternalCalendarEventType, 'rsvped' | 'ignored'>
    ) => {
        if (!selectedEvent) {
            return;
        }

        const { event, element } = selectedEvent;
        await mutate(event.id);
        selectEvent({ ...event, ...patch }, element);
        await onEventRsvpChange?.();
    };

    const toggleSelectedEventSchedule = () => {
        const rsvped = !selectedEvent?.event.rsvped;
        return updateSelectedEvent(
            (eventId) =>
                (rsvped ? rsvpEvent : unrsvpEvent).mutateAsync({ eventId }),
            { rsvped, ignored: false }
        );
    };

    const toggleSelectedEventIgnored = () => {
        const ignored = !selectedEvent?.event.ignored;
        return updateSelectedEvent(
            (eventId) => ignoreEvent.mutateAsync({ eventId, ignored }),
            { rsvped: false, ignored }
        );
    };

    return (
        <div className="relative flex h-full w-full flex-col gap-2">
            <AnimatePresence>
                {selectedEvent?.event && !editMode && (
                    <LongDescriptionModal
                        event={selectedEvent.event}
                        isAdmin={isAdmin}
                        onClose={() => selectEvent()}
                        onToggleSchedule={
                            canScheduleSelectedEvent
                                ? toggleSelectedEventSchedule
                                : undefined
                        }
                        onToggleIgnore={
                            canScheduleSelectedEvent
                                ? toggleSelectedEventIgnored
                                : undefined
                        }
                        scheduleActionDisabled={
                            rsvpEvent.isPending ||
                            unrsvpEvent.isPending ||
                            ignoreEvent.isPending
                        }
                        onEditEvent={
                            isAdmin ? () => setEditMode(true) : undefined
                        }
                        onEventDeleted={isAdmin ? onEventRsvpChange : undefined}
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
                        className={clsx(
                            style.scheduleContainer,
                            maxVisibleColumns && style.fixedVisibleColumns
                        )}
                    >
                        <div className={style.timeColumn}>
                            <div className={style.header} />
                            {Array.from({ length: 24 }, (_, hour) => (
                                <div key={hour} className={style.timeLabel}>
                                    {dayjs().hour(hour).format('h A')}
                                </div>
                            ))}
                        </div>

                        {Object.entries(processedEvents).map(
                            ([dayKey, dayItems], index) => {
                                const day = startDate.add(index, 'day');
                                return (
                                    <div
                                        key={`${dayKey}_${index}`}
                                        className={clsx(
                                            style.dayColumn,
                                            day.isSame(dayjs(), 'day') &&
                                                style.todayColumn
                                        )}
                                        style={
                                            {
                                                '--minColWidth': `${columnWidths[index]}px`,
                                            } as CSSProperties
                                        }
                                    >
                                        <div className={style.header}>
                                            <div
                                                className={style.headerContent}
                                            >
                                                {day.format('ddd D')}
                                            </div>
                                        </div>
                                        <div className={style.dayColumnContent}>
                                            {index === markerColumn && (
                                                <TimelineMarker
                                                    startDate={startDate}
                                                />
                                            )}
                                            {dayItems.map((item) => (
                                                <DayEventItem
                                                    key={item.event.id}
                                                    item={item}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>
            </div>
            {showControls && (
                <div className={style.scheduleControls}>
                    <ToggleGroup
                        type="single"
                        value={viewMode}
                        onValueChange={(value) => {
                            if (value === 'week' || value === 'event') {
                                onViewModeChange?.(value);
                            }
                        }}
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

function processEventsForSchedule(eventsMaps: {
    [id: number]: InternalCalendarEventType[];
}) {
    const keys = Object.keys(eventsMaps);
    const days = Object.values(eventsMaps).map((dayEvents) => [...dayEvents]);
    const out: { [id: string]: ScheduleLayoutItem[] } = {};

    days.forEach((dayEvents, i) => {
        const cropped = dayEvents.map((e) => {
            const minutesToMidnight = e.startTime
                .endOf('day')
                .diff(e.startTime, 'minute');
            const minutesAfterMidnight = e.duration - minutesToMidnight;

            if (minutesAfterMidnight <= 5) {
                return e;
            }

            days[i + 1]?.push({
                ...e,
                startTime: e.startTime.add(1, 'day').startOf('day'),
                duration: minutesAfterMidnight,
            });
            return { ...e, duration: minutesToMidnight };
        });

        out[keys[i]] = layoutDay(cropped);
    });

    return keys.length === 0 ? { 0: [] } : out;
}

function layoutDay(dayEvents: InternalCalendarEventType[]) {
    const deadlines = dayEvents.filter((event) => event.isDeadline);
    const sorted = dayEvents
        .filter((event) => !event.isDeadline)
        .sort(
            (a, b) =>
                a.startTime.valueOf() - b.startTime.valueOf() ||
                b.duration - a.duration ||
                a.id - b.id
        );
    const placed: ScheduleLayoutItem[] = [];

    const deadlineAt = (time: Dayjs) =>
        deadlines.some(
            (deadline) =>
                deadline.startTime.diff(time, 'minute') >= 0 &&
                deadline.startTime.diff(time, 'minute') < splitThresholdMinutes
        );

    for (let i = 0; i < sorted.length; ) {
        const groupStart = sorted[i].startTime;
        let j = i;
        while (
            j < sorted.length &&
            sorted[j].startTime.diff(groupStart, 'minute') <
                splitThresholdMinutes
        ) {
            j++;
        }
        const group = sorted
            .slice(i, j)
            .sort((a, b) => b.duration - a.duration || a.id - b.id);
        i = j;

        const running = placed.filter(({ event }) =>
            event.startTime.add(event.duration, 'minute').isAfter(groupStart)
        );

        for (const p of running) {
            p.visibleMinutes = Math.min(
                p.visibleMinutes,
                groupStart.diff(p.event.startTime, 'minute')
            );
        }

        const level =
            running.length === 0
                ? 0
                : Math.max(...running.map((p) => p.level)) + 1;

        // Reserve the right half for a deadline that starts with this group
        // (e.g. Valorant left | Hacking starts right).
        const slots = group.length + (deadlineAt(groupStart) ? 1 : 0);

        group.forEach((event, slot) => {
            placed.push({
                event,
                level,
                slot,
                slots,
                zIndex: placed.length + 1,
                visibleMinutes: event.duration,
                overlapsBlock: running.length > 0 || slots > 1,
            });
        });
    }

    for (const event of deadlines) {
        const overlapping = placed.some(
            ({ event: other }) =>
                !event.startTime.isBefore(other.startTime) &&
                event.startTime.isBefore(
                    other.startTime.add(other.duration, 'minute')
                )
        );

        placed.push({
            event,
            level: 0,
            slot: 1,
            slots: 2,
            zIndex: placed.length + 501,
            visibleMinutes: event.duration,
            overlapsBlock: overlapping,
        });
    }

    return placed;
}

function DayEventItem({
    item: { event, level, slot, slots, zIndex, visibleMinutes, overlapsBlock },
}: {
    item: ScheduleLayoutItem;
}) {
    const selectEvent = useSetAtom(selectEventAtom);
    const containerRef = useRef<HTMLDivElement>(null);

    const { startTime, duration, eventType } = event;
    const endTime = startTime.add(duration, 'minute');
    const height = minutesToPx(duration);
    const isCompact = height < 64;
    const showMeta = minutesToPx(visibleMinutes) >= 40;
    const showLocation = event.location && slots === 1 && !isCompact;
    const isDeadline = Boolean(event.isDeadline);
    const isRsvpEvent = canAddEventToSchedule(event);
    const needsRsvp = !isDeadline && isRsvpEvent && !event.rsvped;
    const useTypeColors = !isDeadline && (!isRsvpEvent || event.rsvped);
    const { Icon, color, background } = getEventTypeDisplay(eventType);

    return (
        <div
            ref={containerRef}
            className={clsx(
                isDeadline
                    ? style.deadlineEvent
                    : [
                          style.dayEvent,
                          isRsvpEvent
                              ? style.dayEventRsvped
                              : style.dayEventStandard,
                          isCompact && style.dayEventCompact,
                          level > 0 && style.dayEventStacked,
                      ],
                needsRsvp && style.dayEventNeedsRsvp,
                needsRsvp &&
                    (eventType === EventType.WORKSHOP ||
                        eventType === EventType.ACTIVITY) &&
                    style.dayEventNeutralNeedsRsvp,
                useTypeColors && style.dayEventTyped
            )}
            onClick={
                isDeadline
                    ? undefined
                    : () => selectEvent(event, containerRef.current)
            }
            style={
                {
                    '--top': `${Math.round(minutesToPx(minuteOfDay(startTime)))}px`,
                    '--height': `${Math.round(isDeadline ? 52 : height)}px`,
                    '--indent': `${level * cascadeIndent}px`,
                    '--slot': slot,
                    '--slots': slots,
                    '--dayEventZIndex': zIndex,
                    ...(useTypeColors && {
                        '--dayEventBackground': background,
                        '--dayEventHoverBackground': color,
                    }),
                } as CSSProperties
            }
        >
            {isDeadline ? (
                <div className={style.deadlineEventContent}>
                    <span className={style.deadlineEventTitle}>
                        {event.title}
                    </span>
                    {!overlapsBlock && (
                        <span className={style.deadlineEventTime}>
                            {startTime.format(
                                startTime.minute() === 0 ? 'hA' : 'h:mmA'
                            )}
                        </span>
                    )}
                </div>
            ) : (
                <div className={style.dayEventContent}>
                    <span
                        className={clsx(
                            style.dayEventLine,
                            style.dayEventTitle
                        )}
                    >
                        {event.title}
                    </span>
                    {showMeta && (
                        <span
                            className={clsx(
                                style.dayEventLine,
                                style.dayEventMeta
                            )}
                        >
                            <Icon className={style.dayEventIcon} />
                            <span className={style.dayEventMetaText}>
                                {`${startTime.format('h:mm A')} - ${endTime.format('h:mm A')}`}
                                {showLocation && ` · ${event.location}`}
                            </span>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

function TimelineMarker({ startDate }: { startDate: Dayjs }) {
    const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
    const top = minutesToPx(minuteOfDay(currentTime));
    const markerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function updateTime() {
            setCurrentTime(dayjs());

            if (currentTime.isBefore(startDate)) {
                getScrollParent(markerRef.current)?.scrollTo({
                    top: top - 300,
                    behavior: 'smooth',
                });
            } else {
                markerRef.current?.scrollIntoView({
                    block: 'center',
                    inline: 'center',
                    behavior: 'smooth',
                });
            }
        }

        setCurrentTime(dayjs());
        const interval = setInterval(updateTime, 60000);
        const timeout = setTimeout(updateTime, 100);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div
            ref={markerRef}
            style={{ '--top': `${Math.round(top)}px` } as CSSProperties}
            className={style.timeMarker}
        >
            <div className={style.timeText}>{currentTime.format('hh:mm')}</div>
        </div>
    );
}

function getScrollParent(node: HTMLElement | null): HTMLElement | null {
    const parent = node?.parentElement;
    if (!parent) {
        return null;
    }

    return parent.scrollHeight > parent.clientHeight
        ? parent
        : getScrollParent(parent);
}
