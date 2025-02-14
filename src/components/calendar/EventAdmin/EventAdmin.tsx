import { CalendarEvent } from '@/server/routers/eventsRouter';
import { atom, PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from 'jotai';
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
import dayjs from 'dayjs';

export interface EventAdminProps {
    eventsAtom: PrimitiveAtom<CalendarEvent[]>;
}
export const editModeAtom = atom(false);

export function EventAdmin({ eventsAtom }: EventAdminProps) {
    const [_selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
    const [events, setEvents] = useAtom(eventsAtom);
    const [editMode, setEditMode] = useAtom(editModeAtom);

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

    useEffect(() => {
        setEvent(ConvertEvent(_selectedEvent?.event));
    }, [_selectedEvent?.event]);

    const longDescriptionFetch = trpc.events.getEventLongDescription.useQuery({
        eventId: event.id ?? -1,
    });
    const [longDescription, setLongDescription] = useState('');
    useEffect(() => {
        setLongDescription(longDescriptionFetch.data?.longDescription ?? '');
    }, [longDescriptionFetch.data]);

    const updateEventapi = trpc.events.updateEvent.useMutation();
    const createEventApi = trpc.events.createEvent.useMutation();
    const eventsFetch = trpc.events.getEvents.useQuery(
        { hackathonId: 1 },
        {
            enabled: false,
        }
    );

    const deleteApi = trpc.events.deleteEvent.useMutation();

    async function saveEvent(e: SubmitEvent) {
        e.preventDefault();
        if (!_selectedEvent) {
            createEventApi.mutate({
                ...event,
                startDate: event.startDate.getTime(),
                endDate: event.endDate.getTime(),
                longDescription,
            });
        } else {
            updateEventapi.mutate({
                ...event,
                eventId: event.id,
                startDate: event.startDate.getTime(),
                endDate: event.endDate.getTime(),
                longDescription,
            });
        }

        const res = await eventsFetch.refetch();
        setEvents(
            res.data?.map((item) => {
                return {
                    ...item,
                    startDate: new Date(item.startDate),
                    endDate: new Date(item.endDate),
                };
            }) ?? []
        );

        setEditMode(false);
    }

    function deleteEvent() {
        deleteApi.mutate({ eventId: event.id });
    }

    useEffect(() => {
        if (!editMode) {
            setSelectedEvent(undefined);
        }
    }, [editMode]);

    return (
        <>
            <SideDrawer visibleAtom={editModeAtom}>
                <h1>{event ? 'Edit event' : 'Add event'}</h1>
                {/* @ts-ignore */}
                <form onSubmit={saveEvent}>
                    <div>
                        <Label>Event Name</Label>
                        <FormTextInput
                            placeholder=" "
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
                            placeholder=" "
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
                            placeholder=" "
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
                            defaultValue={
                                event.startDate
                                    ? dayjs(event.startDate).format(
                                          'YYYY-MM-DDTHH:mm:ss'
                                      )
                                    : ''
                            }
                            type="datetime-local"
                            lazy
                            required
                            onLazyChange={(t) => {
                                setEvent({
                                    ...event,
                                    startDate: dayjs(new Date(t)).toDate(),
                                });
                            }}
                        />
                    </div>

                    <div>
                        <Label>End Time</Label>
                        <FormTextInput
                            defaultValue={
                                event.endDate
                                    ? dayjs(event.endDate).format(
                                          'YYYY-MM-DDTHH:mm:ss'
                                      )
                                    : ''
                            }
                            type="datetime-local"
                            lazy
                            required
                            onLazyChange={(t) => {
                                setEvent({
                                    ...event,
                                    endDate: dayjs(new Date(t)).toDate(),
                                });
                            }}
                        />
                    </div>

                    <div>
                        <Label>Long Description (Markdown)</Label>
                        <FormTextArea
                            placeholder=" "
                            defaultValue={longDescription}
                            lazy
                            onLazyChange={(t) => {
                                setLongDescription(t);
                                console.log('in change', t);
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
                    {_selectedEvent && (
                        <Button
                            onClick={deleteEvent}
                            size={'compact'}
                            hierarchy={'primary'}
                            variant={'caution'}
                        >
                            Delete
                        </Button>
                    )}
                </form>
            </SideDrawer>
        </>
    );
}
