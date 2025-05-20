import {
    currentYearMonthAtom,
    getEventsOfMonth,
    InternalCalendarEventType,
    selectedDayAtom,
} from '@/components/calendar/MonthCalendarShared';
import { useAtom, useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import style from './ImproveMobileCalendar.module.css';
import { LinearTimeline } from '@/components/calendar/LinearTimeLine/LinearTimeline';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { DialogTitle } from '@radix-ui/react-dialog';
import { DaySchedule } from '@/components/calendar/DaySchedule/DaySchedule';
import dayjs from 'dayjs';
import clsx from 'clsx';

export function MobileCalendar({
    events,
}: {
    events: InternalCalendarEventType[];
}) {
    const [{ year, month }, updateYearMonth] = useAtom(currentYearMonthAtom);
    const [selectedDay, setSelectedDay] = useAtom(selectedDayAtom);

    const filteredEvents = useMemo(
        () => getEventsOfMonth(events, month, year, false),
        [year, month]
    );

    // filters to get a set of days that has an event.
    const daysWithEvents = useMemo(() => {
        const out = new Set<number>();
        for (const e of filteredEvents) {
            if (!out.has(e.startTime.get('day'))) {
                out.add(e.startTime.get('day'));
            }
        }
        return out;
    }, [filteredEvents]);

    const [dayEvents, setDayEvents] = useState<
        InternalCalendarEventType[] | undefined
    >();

    return (
        <>
            <Drawer
                open={dayEvents !== undefined}
                onClose={() => {
                    setDayEvents(undefined);
                }}
            >
                <DrawerContent>
                    <DialogTitle style={{ display: 'none' }}>
                        Events of {selectedDay?.format('MMM DD')}
                    </DialogTitle>

                    <div
                        style={{
                            width: '100%',
                            maxHeight: '70dvh',
                            height: '1000px',
                            marginTop: '2rem',
                        }}
                    >
                        <DaySchedule
                            days={1}
                            events={dayEvents ?? []}
                            minColumnWidth={200}
                            startDate={selectedDay ?? dayjs()}
                        />
                    </div>
                </DrawerContent>
            </Drawer>

            <div className={style.MCPage}>
                <div></div>

                <LinearTimeline
                    events={filteredEvents}
                    daySelected={(eventsOfDay) => {
                        setDayEvents(dayEvents);
                    }}
                />
            </div>
        </>
    );
}

interface MobileCalendarProps {
    daysWithEvent: Set<number>;
}
function MobileCalender({ daysWithEvent }: MobileCalendarProps) {
    const [selectedDay, setSelectedDay] = useAtom(selectedDayAtom);
    const { year, month } = useAtomValue(currentYearMonthAtom);

    return (
        <div className={style.Container}>
            <div className={style.DayRow}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(
                    (item) => (
                        <span className={style.DayRowItem}>{item}</span>
                    )
                )}
            </div>
        </div>
    );
}
