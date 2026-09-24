import { useMemo } from 'react';
import {
    selectEventAtom,
    type InternalCalendarEventType,
} from '../MonthCalendarShared';
import {
    Card,
    CardContent,
    CardHeader,
    CardHeaderTitle,
} from '@/components/ui/card';
import { ScheduleEventCard } from '../ScheduleEventCard/ScheduleEventCard';
import { useSetAtom } from 'jotai';

export function ScheduleEventsCard({
    events,
}: {
    events: InternalCalendarEventType[];
}) {
    const selectEvent = useSetAtom(selectEventAtom);
    const { addedEvents, notAddedEvents } = useMemo(() => {
        const sortedEvents = [...events].sort((a, b) => {
            return a.startTime.valueOf() - b.startTime.valueOf();
        });

        return {
            addedEvents: sortedEvents.filter((event) => event.rsvped),
            notAddedEvents: sortedEvents.filter((event) => !event.rsvped),
        };
    }, [events]);

    return (
        <Card className="min-h-0 overflow-hidden bg-neutral-900">
            <CardHeader className="flex-none p-4">
                <CardHeaderTitle className="text-lg">Events</CardHeaderTitle>
            </CardHeader>
            <CardContent className="no-scrollbar min-h-0 gap-3 overflow-y-auto p-4">
                {notAddedEvents.map((event) => (
                    <ScheduleEventCard
                        key={event.id}
                        event={event}
                        statusLabel="Not Yet Added"
                        onClick={() => {
                            selectEvent(event);
                        }}
                    />
                ))}
                {addedEvents.length > 0 && (
                    <div className="flex items-center gap-2 py-1">
                        <div className="h-px flex-1 bg-neutral-700/60" />
                        <span className="shrink-0 text-[10px] font-medium text-[var(--text-secondary)] uppercase">
                            On your schedule
                        </span>
                        <div className="h-px flex-1 bg-neutral-700/60" />
                    </div>
                )}
                {addedEvents.map((event) => (
                    <ScheduleEventCard
                        key={event.id}
                        event={event}
                        statusLabel="Added"
                        statusVariant="brand"
                        onClick={() => {
                            selectEvent(event);
                        }}
                    />
                ))}
            </CardContent>
        </Card>
    );
}
