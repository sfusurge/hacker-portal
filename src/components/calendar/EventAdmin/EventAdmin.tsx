import { CalendarEvent } from '@/server/routers/eventsRouter';
import { atom, PrimitiveAtom, useAtom, useAtomValue } from 'jotai';
import { selectedEventAtom } from '../MonthCalendarShared';
import { SideDrawer } from '@/components/ui/SideDrawer/SideDrawer';
import { useMemo } from 'react';

export interface EventAdminProps {
    eventsAtom: PrimitiveAtom<CalendarEvent[]>;
}
export const editModeAtom = atom(false);

export function EventAdmin({ eventsAtom }: EventAdminProps) {
    const [_selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
    const [events, setEvents] = useAtom(eventsAtom);
    const editMode = useAtomValue(editModeAtom);

    const selectedEvent = useMemo(() => {
        return Object.assign({}, _selectedEvent);
    }, [_selectedEvent]);

    return (
        <>
            <SideDrawer visibleAtom={editModeAtom}>
                <h1>ADMIN STUFF GOES HERE</h1>
            </SideDrawer>
        </>
    );
}
