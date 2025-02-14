import { CalendarEvent } from '@/server/routers/eventsRouter';
import { atom, PrimitiveAtom, useAtom, useAtomValue } from 'jotai';
import {
    InternalCalendarEventType,
    selectedEventAtom,
} from '../MonthCalendarShared';
import { SideDrawer } from '@/components/ui/SideDrawer/SideDrawer';
import { useEffect, useMemo, useState } from 'react';
import { FormTextInput, Input } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/ColorPicker/ColorPicker';
import { trpc } from '@/trpc/client';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';
import { Button } from '@/components/ui/button';

export interface EventAdminProps {
    eventsAtom: PrimitiveAtom<CalendarEvent[]>;
}
export const editModeAtom = atom(false);

export function EventAdmin({ eventsAtom }: EventAdminProps) {
    const [_selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
    const [events, setEvents] = useAtom(eventsAtom);
    const editMode = useAtomValue(editModeAtom);

    function ConvertEvent(e: InternalCalendarEventType | undefined) {
        if (e) {
            const { startTime, endTime, ...rest } = e;
            return {
                ...rest,
                startDate: startTime.toDate(),
                endDate: endTime.toDate(),
            } as CalendarEvent;
        } else {
            return { color: '#6466F1', hackathonId: 1 } as CalendarEvent;
        }
    }

    const [event, setEvent] = useState(ConvertEvent(_selectedEvent?.event));
    const longDescriptionFetch = trpc.events.getEventLongDescription.useQuery({
        eventId: event.id ?? -1,
    });
    const [longDescription, setLongDescription] = useState('');
    useEffect(() => {
        setLongDescription(longDescriptionFetch.data?.longDescription ?? '');
    }, [longDescriptionFetch]);

    const updateEventapi = trpc.events.updateEvent.useMutation();
    const createEventApi = trpc.events.createEvent.useMutation();
    const eventsFetch = trpc.events.getEvents.useQuery(
        { hackathonId: 1 },
        {
            enabled: false,
        }
    );
    function saveEvent(e: SubmitEvent) {
        e.preventDefault();
        createEventApi.mutate({
            color: '',
            endDate: new Date(),
            startDate: new Date(),
            hackathonId: 1,
            location: '',
            title: '',
            description: '',
            longDescription: '',
        });

        return;
        if (!_selectedEvent) {
            console.log({ ...event, eventId: event.id });
            createEventApi.mutate({ ...event, longDescription });
        } else {
            updateEventapi.mutate({
                ...event,
                eventId: event.id,
                longDescription,
            });
        }

        eventsFetch.refetch();
        const y = eventsFetch.data;
        console.log(y);
        const s = (eventsFetch.data ?? []) as CalendarEvent[];
        setEvents(eventsFetch.data ?? []);
    }

    useEffect(() => {
        console.log(event);
    }, [event]);

    return (
        <>
            <SideDrawer visibleAtom={editModeAtom}>
                <h1>{event ? 'Edit event' : 'Add event'}</h1>
                <button onClick={saveEvent}>TRest</button>
                <form onSubmit={saveEvent}>
                    <div>
                        <Label>Event Name</Label>
                        <FormTextInput
                            type="text"
                            defaultValue={event.title ?? ''}
                            required
                            lazy
                            onLazyChange={(txt) => {
                                setEvent({ ...event, title: `${txt}` });
                            }}
                        />
                    </div>

                    <div>
                        <Label>Color</Label>
                        <ColorPicker
                            colors={[
                                '#6466F1',
                                '#0EA5E9',
                                '#F43F5E',
                                '#D946EF',
                                '#8B5CF6',
                                '#14B8A6',
                                '#84CC16',
                            ]}
                            colorChange={(c) => {
                                setEvent({ ...event, color: c });
                            }}
                            selectedColor={event.color}
                        />
                    </div>

                    <div>
                        <Label>Description</Label>
                        <FormTextInput
                            type="text"
                            required
                            lazy
                            defaultValue={event.description ?? ''}
                            onLazyChange={(txt) => {
                                event.description = `${txt}`;
                            }}
                        />
                    </div>
                    <div>
                        <Label>Location</Label>
                        <FormTextInput
                            defaultValue={event.location}
                            type="text"
                            required
                            lazy
                            onLazyChange={(t) => {
                                setEvent({ ...event, location: `${t}` });
                            }}
                        />
                    </div>
                    <div>
                        <Label>Start Time</Label>
                        <FormTextInput
                            defaultValue={event.startDate?.toDateString()}
                            type="datetime-local"
                            lazy
                            required
                            onLazyChange={(t) => {
                                setEvent({ ...event, startDate: new Date(t) });
                            }}
                        />
                    </div>

                    <div>
                        <Label>End Time</Label>
                        <FormTextInput
                            defaultValue={event.endDate?.toDateString()}
                            type="datetime-local"
                            lazy
                            required
                            onLazyChange={(t) => {
                                setEvent({ ...event, endDate: new Date(t) });
                            }}
                        />
                    </div>

                    <div>
                        <Label>Long Description (Markdown)</Label>
                        <FormTextArea
                            defaultValue={longDescription}
                            lazy
                            onLazyChange={(t) => {
                                setLongDescription(t);
                            }}
                        />
                    </div>

                    <Button
                        role="submit"
                        type="submit"
                        size="compact"
                        hierarchy="primary"
                        variant="brand"
                    >
                        {_selectedEvent ? 'Save Edit' : 'Create new event'}
                    </Button>
                </form>
            </SideDrawer>
        </>
    );
}
