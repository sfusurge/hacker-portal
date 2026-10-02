'use client';

import { useState } from 'react';
import {
    CalendarDaysIcon,
    ChevronLeftIcon,
    MapPinIcon,
    UserGroupIcon,
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { DrawerTitle } from '@/components/ui/drawer';
import { DeleteEventDialog } from '@/components/calendar/DeleteEventDialog/DeleteEventDialog';
import {
    EventDetailRow,
    EventLongDescriptionContent,
    getEventDetailsTimeLabel,
} from '@/components/calendar/EventLongDescription/EventLongDescription';
import type { InternalCalendarEventType } from '@/components/calendar/MonthCalendarShared';
import { trpc } from '@/trpc/client';

interface MobileEventDetailProps {
    event: InternalCalendarEventType;
    onBack: () => void;
    onEdit: (event: InternalCalendarEventType) => void;
    onDeleted: () => void | Promise<void>;
}

export function MobileEventDetail({
    event,
    onBack,
    onEdit,
    onDeleted,
}: MobileEventDetailProps) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const rsvpCount = trpc.events.getEventRsvpCount.useQuery({
        eventId: event.id,
    });

    return (
        <div className="flex flex-col gap-4">
            <button
                type="button"
                onClick={onBack}
                className="flex w-fit items-center gap-1 text-sm text-white/60"
            >
                <ChevronLeftIcon className="size-4" />
                All events
            </button>

            <div className="flex flex-col gap-1">
                <DrawerTitle className="text-base">{event.title}</DrawerTitle>
                <span className="flex items-center gap-1 text-xs text-white/60">
                    <CalendarDaysIcon className="size-3.5" />
                    {getEventDetailsTimeLabel(event)}
                </span>
            </div>

            <EventLongDescriptionContent event={event} />

            <div className="flex flex-col gap-2">
                {event.location && (
                    <EventDetailRow
                        icon={MapPinIcon}
                        label="Location"
                        value={event.location}
                    />
                )}
                <EventDetailRow
                    icon={UserGroupIcon}
                    label="Added to schedule"
                    value={
                        rsvpCount.isLoading
                            ? '...'
                            : (rsvpCount.data?.rsvpCount ?? 0)
                    }
                />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                    type="button"
                    size="compact"
                    variant="default"
                    hierarchy="primary"
                    onClick={() => onEdit(event)}
                >
                    Edit event
                </Button>
                <Button
                    type="button"
                    size="compact"
                    variant="danger"
                    hierarchy="primary"
                    onClick={() => setConfirmOpen(true)}
                >
                    Delete event
                </Button>
            </div>

            <DeleteEventDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                eventId={event.id}
                onDeleted={onDeleted}
            />
        </div>
    );
}
