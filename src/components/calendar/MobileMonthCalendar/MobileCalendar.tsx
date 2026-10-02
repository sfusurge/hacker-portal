import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { DaySchedule } from '@/components/calendar/DaySchedule/DaySchedule';
import type { InternalCalendarEventType } from '@/components/calendar/MonthCalendarShared';
import { Button } from '@/components/ui/button';
import { MobileWeekStrip } from './MobileWeekStrip';
import { MobileEventsDrawer } from './MobileEventsDrawer';

export function MobileCalendar({
    events,
    isAdmin = false,
    onEventRsvpChange,
}: {
    events: InternalCalendarEventType[];
    isAdmin?: boolean;
    onEventRsvpChange?: () => void | Promise<void>;
}) {
    const [selectedDay, setSelectedDay] = useState(() =>
        dayjs().startOf('day')
    );
    const [eventsOpen, setEventsOpen] = useState(false);

    const daysWithEvents = useMemo(
        () => new Set(events.map((e) => e.startTime.format('YYYY-MM-DD'))),
        [events]
    );

    const dayEvents = useMemo(
        () => events.filter((e) => e.startTime.isSame(selectedDay, 'day')),
        [events, selectedDay]
    );

    const drawerEvents = useMemo(
        () => dayEvents.filter((e) => !e.isDeadline),
        [dayEvents]
    );

    return (
        <div className="flex h-full min-h-0 flex-col">
            <MobileWeekStrip
                selectedDay={selectedDay}
                onSelectDay={(day) => setSelectedDay(day.startOf('day'))}
                daysWithEvents={daysWithEvents}
            />

            <div className="min-h-0 flex-1 px-3">
                <DaySchedule
                    days={1}
                    startDate={selectedDay}
                    events={dayEvents}
                    showControls={false}
                    isAdmin={isAdmin}
                    onEventRsvpChange={onEventRsvpChange}
                />
            </div>

            <div className="flex items-center justify-between px-3 py-3">
                <Button
                    type="button"
                    size="compact"
                    variant="default"
                    hierarchy="secondary"
                    onClick={() => setSelectedDay(dayjs().startOf('day'))}
                >
                    Jump to Today
                </Button>
                <Button
                    type="button"
                    size="compact"
                    variant="default"
                    hierarchy="secondary"
                    onClick={() => setEventsOpen(true)}
                >
                    Events
                </Button>
            </div>

            <MobileEventsDrawer
                open={eventsOpen}
                onOpenChange={setEventsOpen}
                day={selectedDay}
                events={drawerEvents}
                isAdmin={isAdmin}
                onEventsChanged={onEventRsvpChange}
            />
        </div>
    );
}
