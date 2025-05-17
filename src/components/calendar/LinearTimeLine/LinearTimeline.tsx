import style from './LinearTimeline.module.css';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import {
    groupEventsByDay,
    timeBetween,
    selectedDayAtom,
    yearMonthDay,
    InternalCalendarEventType,
    currentYearMonthAtom,
    getEventDurationString,
    selectedEventAtom,
} from '../MonthCalendarShared';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import dayjs, { Dayjs } from 'dayjs';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'motion/react';
import {
    EventLongDescriptionContent,
    LongDescriptionModal,
} from '../EventLongDescription/EventLongDescription';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { DialogTitle } from '@/components/ui/dialog';

const DATE_FORMAT = 'MMM DD, dddd';

const showMoreInfoEvent = atom<InternalCalendarEventType | undefined>(
    undefined
);

export function LinearTimeline({
    events,
    styles,
    daySelected,
}: {
    events: InternalCalendarEventType[];
    daySelected: (eventsOfDay: InternalCalendarEventType[]) => void;
    styles?: CSSProperties | undefined;
}) {
    const { month, year } = useAtomValue(currentYearMonthAtom);

    const eventsGroupedByDay = groupEventsByDay(
        events,
        dayjs(new Date(month, year, 1))
    );

    const [showMoreInfo, setShowMore] = useAtom(showMoreInfoEvent);

    return (
        <>
            <Drawer
                open={showMoreInfo !== undefined}
                onClose={() => {
                    setShowMore(undefined);
                }}
            >
                <DrawerContent>
                    <DialogTitle>{showMoreInfo?.title}</DialogTitle>
                    {showMoreInfo && (
                        <EventLongDescriptionContent event={showMoreInfo} />
                    )}
                </DrawerContent>
            </Drawer>

            <div className={style.timelineContainer} style={styles}>
                {Object.entries(eventsGroupedByDay).map((e) => {
                    const [key, eventsOfDay] = e;

                    return (
                        <TimeLineDayWrapper
                            key={key}
                            eventsOfDay={eventsOfDay}
                            daySelected={daySelected}
                        ></TimeLineDayWrapper>
                    );
                })}
            </div>
        </>
    );
}

function TimeLineDayWrapper({
    eventsOfDay,
    daySelected,
}: {
    eventsOfDay: InternalCalendarEventType[];
    daySelected: (eventsOfDay: InternalCalendarEventType[]) => void;
}) {
    const [selectedDay, setSelectedDay] = useAtom(selectedDayAtom);

    const dayId = yearMonthDay(eventsOfDay[0].startTime);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedDay?.isSame(dayId, 'date')) {
            ref.current!.parentElement!.scrollTo({
                behavior: 'smooth',
                top: ref.current!.offsetTop,
            });
        }
    }, [selectedDay]);

    return (
        <div className={style.dayWrapper} ref={ref}>
            <div
                className={style.timelineHeader}
                onClick={() => {
                    daySelected(eventsOfDay);
                    setSelectedDay(eventsOfDay[0].startTime);
                }}
            >
                {eventsOfDay[0].startTime.format(DATE_FORMAT)}
            </div>

            {eventsOfDay.map((item) => (
                <TimelineItem key={item.id} event={item}></TimelineItem>
            ))}
        </div>
    );
}

function TimelineItem({ event }: { event: InternalCalendarEventType }) {
    const [contentHeight, setContentHeight] = useState(0);
    const innerContentRef = useRef<HTMLDivElement | null>(null);
    const setSelected = useSetAtom(selectedEventAtom);
    function expandContent() {
        if (contentHeight === 0) {
            setContentHeight(innerContentRef.current?.scrollHeight!);
            setSelected({ element: undefined, event: event });
        } else {
            setContentHeight(0);
            setSelected(undefined);
        }
    }

    const setShowMore = useSetAtom(showMoreInfoEvent);

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
                    <span className={style.line}>
                        <ClockIcon
                            style={{ width: '1rem', margin: '0.25rem' }}
                        />
                        {getEventDurationString(event)}
                    </span>

                    {event.location && (
                        <span className={style.line}>
                            <MapPinIcon
                                style={{ width: '1rem', margin: '0.25rem' }}
                            />
                            {event.location}
                        </span>
                    )}

                    {event.description && (
                        <span className={style.line}>{event.description}</span>
                    )}

                    {event.hasLongDescription && (
                        <Button
                            onClick={() => {
                                setShowMore(event);
                            }}
                            size="compact"
                            variant="default"
                            hierarchy="secondary"
                            style={{ margin: '0.25rem', marginLeft: 'auto' }}
                        >
                            More Info
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function TimeLabel({ event }: { event: InternalCalendarEventType }) {
    return <span>{event.startTime.format('h:mm A')}</span>;
}
