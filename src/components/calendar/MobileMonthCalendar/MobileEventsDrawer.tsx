'use client';

import { useState, type MouseEvent } from 'react';
import type { Dayjs } from 'dayjs';
import { useSetAtom } from 'jotai';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import {
    editModeAtom,
    selectEventAtom,
    type InternalCalendarEventType,
} from '@/components/calendar/MonthCalendarShared';
import {
    AdminScheduleEventCard,
    ScheduleEventsCard,
} from '@/components/calendar/ScheduleEventsCard/ScheduleEventsCard';
import { MobileEventDetail } from './MobileEventDetail';

interface MobileEventsDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    day: Dayjs;
    events: InternalCalendarEventType[];
    isAdmin?: boolean;
    onEventsChanged?: () => void | Promise<void>;
}

export function MobileEventsDrawer({
    open,
    onOpenChange,
    day,
    events,
    isAdmin = false,
    onEventsChanged,
}: MobileEventsDrawerProps) {
    const [detailEvent, setDetailEvent] = useState<InternalCalendarEventType>();
    const selectEvent = useSetAtom(selectEventAtom);
    const setEditMode = useSetAtom(editModeAtom);

    function handleOpenChange(next: boolean) {
        onOpenChange(next);
        if (!next) {
            setDetailEvent(undefined);
        }
    }

    function handleEdit(event: InternalCalendarEventType) {
        handleOpenChange(false);
        selectEvent(event);
        setEditMode(true);
    }

    async function handleDeleted() {
        await onEventsChanged?.();
        setDetailEvent(undefined);
    }

    // The card already calls selectEvent; DaySchedule then opens
    // LongDescriptionModal, which would sit under the drawer.
    function closeOnCardTap(e: MouseEvent<HTMLDivElement>) {
        if ((e.target as HTMLElement).closest('button')) {
            handleOpenChange(false);
        }
    }

    return (
        <Drawer open={open} onOpenChange={handleOpenChange}>
            <DrawerContent hideCloseButton className="max-h-[75dvh]">
                {!isAdmin ? (
                    <div onClick={closeOnCardTap}>
                        <DrawerTitle className="sr-only">Events</DrawerTitle>
                        <ScheduleEventsCard events={events} isAdmin={false} />
                    </div>
                ) : detailEvent ? (
                    <MobileEventDetail
                        event={detailEvent}
                        onBack={() => setDetailEvent(undefined)}
                        onEdit={handleEdit}
                        onDeleted={handleDeleted}
                    />
                ) : (
                    <>
                        <DrawerHeader>
                            <DrawerTitle className="text-base">
                                Events
                            </DrawerTitle>
                            <DrawerDescription>
                                The events running on {day.format('MMMM D')}
                            </DrawerDescription>
                        </DrawerHeader>
                        {events.length === 0 ? (
                            <p className="text-sm text-white/60">
                                No events on this day.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {events.map((e) => (
                                    <AdminScheduleEventCard
                                        key={e.id}
                                        event={e}
                                        onClick={() => setDetailEvent(e)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </DrawerContent>
        </Drawer>
    );
}
