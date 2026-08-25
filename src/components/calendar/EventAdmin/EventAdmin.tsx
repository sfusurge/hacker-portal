import { CalendarEvent } from '@/server/routers/eventsRouter';
import { atom, PrimitiveAtom, useAtom, useAtomValue } from 'jotai';
import {
    DayjsifyEvents,
    InternalCalendarEventType,
    selectedEventAtom,
} from '../MonthCalendarShared';
import { SideDrawer } from '@/components/ui/SideDrawer/SideDrawer';
import { type FormEvent, useEffect, useState } from 'react';
import { FormTextInput } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/ColorPicker/ColorPicker';
import { trpc } from '@/trpc/client';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import { CheckBoxWithLabel } from '@/components/ui/checkbox/checkboxWithLabel';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { EVENT_TYPES, EventType } from '@/db/schema/events';
import { hackathonAtom } from '@/app/(auth)/ClientContext';

export interface EventAdminProps {
    eventsAtom: PrimitiveAtom<InternalCalendarEventType[]>;
}
export const editModeAtom = atom(false);

export function EventAdmin({ eventsAtom }: EventAdminProps) {
    const [_selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
    const [, setEvents] = useAtom(eventsAtom);
    const [editMode, setEditMode] = useAtom(editModeAtom);

    const [event, setEvent] = useState<CalendarEvent>();

    const hackathon = useAtomValue(hackathonAtom);

    useEffect(() => {
        setEvent(convertEvent(hackathon.id, _selectedEvent?.event));
    }, [hackathon?.id, _selectedEvent?.event]);

    const longDescriptionFetch = trpc.events.getEventLongDescription.useQuery({
        eventId: event?.id ?? -1,
    });
    const [longDescription, setLongDescription] = useState('');
    useEffect(() => {
        setLongDescription(longDescriptionFetch.data?.longDescription ?? '');
    }, [longDescriptionFetch.data]);

    const updateEventapi = trpc.events.updateEvent.useMutation();
    const createEventApi = trpc.events.createEvent.useMutation();
    const eventsFetch = trpc.events.getEvents.useQuery(
        { hackathonId: hackathon?.id! },
        {
            enabled: false,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        }
    );

    const deleteApi = trpc.events.deleteEvent.useMutation();
    const checkIns = trpc.events.getEventCheckInCount.useQuery(
        { eventId: event?.id ?? -1 },
        { enabled: Boolean(_selectedEvent && event?.id) }
    );
    const hasCheckIns = (checkIns.data?.checkInCount ?? 0) > 0;

    async function refreshEvents() {
        const res = await eventsFetch.refetch();
        setEvents(
            DayjsifyEvents(
                res.data?.map((item) => {
                    return {
                        ...item,
                        startDate: new Date(item.startDate),
                        endDate: new Date(item.endDate),
                    };
                }) ?? []
            )
        );
    }

    function updateEvent<K extends keyof CalendarEvent>(
        key: K,
        value: CalendarEvent[K]
    ) {
        setEvent((current) => {
            if (!current) {
                return current;
            }

            return {
                ...current,
                [key]: value,
            };
        });
    }

    async function saveEvent(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!event) {
            return;
        }

        const formData = new FormData(e.currentTarget);
        const getValue = (name: string) => String(formData.get(name) ?? '');
        const submittedEvent = {
            ...event,
            title: getValue('title'),
            description: getValue('description'),
            location: getValue('location'),
            startDate: dayjs(new Date(getValue('startDate'))).toDate(),
            endDate: dayjs(new Date(getValue('endDate'))).toDate(),
        };
        const submittedLongDescription = getValue('longDescription');

        if (!_selectedEvent) {
            await createEventApi.mutateAsync({
                ...submittedEvent,
                startDate: submittedEvent.startDate.getTime(),
                endDate: submittedEvent.endDate.getTime(),
                longDescription: submittedLongDescription,
            });
        } else {
            await updateEventapi.mutateAsync({
                ...submittedEvent,
                eventId: submittedEvent.id!,
                startDate: submittedEvent.startDate?.getTime()!,
                endDate: submittedEvent.endDate?.getTime()!,
                longDescription: submittedLongDescription,
            });
        }

        await refreshEvents();
        setEditMode(false);
    }

    async function deleteEvent() {
        if (!event || hasCheckIns) {
            return;
        }

        await deleteApi.mutateAsync({ eventId: event.id });
        await refreshEvents();
        setEditMode(false);
    }

    useEffect(() => {
        if (!editMode) {
            setSelectedEvent(undefined);
        }
    }, [editMode]);

    if (!hackathon) {
        return false;
    }

    return (
        <>
            <SideDrawer visibleAtom={editModeAtom}>
                <h1>{_selectedEvent ? 'Edit event' : 'Add event'}</h1>
                <form onSubmit={saveEvent}>
                    <div>
                        <Label>Event Name</Label>
                        <FormTextInput
                            name="title"
                            placeholder=" "
                            type="text"
                            defaultValue={event?.title ?? ''}
                            required
                            lazy
                            onLazyChange={(txt) => {
                                updateEvent('title', txt);
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
                                updateEvent('color', c);
                            }}
                            selectedColor={event?.color ?? ''}
                        />
                    </div>

                    <div>
                        <Label>Description</Label>
                        <FormTextInput
                            name="description"
                            placeholder=" "
                            type="text"
                            required
                            lazy
                            defaultValue={event?.description ?? ''}
                            onLazyChange={(txt) => {
                                updateEvent('description', txt);
                            }}
                        />
                    </div>
                    <div>
                        <Label>Location</Label>
                        <FormTextInput
                            name="location"
                            placeholder=" "
                            defaultValue={event?.location ?? ''}
                            type="text"
                            required
                            lazy
                            onLazyChange={(t) => {
                                updateEvent('location', t);
                            }}
                        />
                    </div>
                    <div>
                        <Label>Start Time</Label>
                        <FormTextInput
                            name="startDate"
                            defaultValue={
                                event?.startDate
                                    ? dayjs(event.startDate).format(
                                          'YYYY-MM-DDTHH:mm:ss'
                                      )
                                    : ''
                            }
                            type="datetime-local"
                            lazy
                            required
                            onLazyChange={(t) => {
                                updateEvent(
                                    'startDate',
                                    dayjs(new Date(t)).toDate()
                                );
                            }}
                        />
                    </div>

                    <div>
                        <Label>End Time</Label>
                        <FormTextInput
                            name="endDate"
                            defaultValue={
                                event?.endDate
                                    ? dayjs(event.endDate).format(
                                          'YYYY-MM-DDTHH:mm:ss'
                                      )
                                    : ''
                            }
                            type="datetime-local"
                            lazy
                            required
                            onLazyChange={(t) => {
                                updateEvent(
                                    'endDate',
                                    dayjs(new Date(t)).toDate()
                                );
                            }}
                        />
                    </div>

                    <div>
                        <Label>Long Description (Markdown)</Label>
                        <FormTextArea
                            name="longDescription"
                            placeholder=" "
                            defaultValue={longDescription}
                            lazy
                            onLazyChange={(t) => {
                                setLongDescription(t);
                            }}
                        />
                    </div>

                    <div>
                        <Label>Select Event</Label>
                        <Select
                            value={event?.eventType ?? EventType.EVENT}
                            defaultValue="Event"
                            onValueChange={(eventType) => {
                                if (!event) {
                                    return;
                                }

                                setEvent({
                                    ...event,
                                    eventType: eventType as EventType,
                                });
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Choose Event Type" />
                            </SelectTrigger>
                            <SelectContent className="z-[9999] bg-neutral-800 text-white">
                                <SelectGroup>
                                    <SelectLabel>Event Type</SelectLabel>
                                    {EVENT_TYPES.map((eventType) => {
                                        return (
                                            <SelectItem
                                                key={eventType}
                                                value={eventType}
                                            >
                                                {eventType}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="mb-2">
                        <Label>Has check-in?</Label>
                        <CheckBoxWithLabel
                            name="yes"
                            checked={event?.hasCheckIn ?? false}
                            onChange={(e) => {
                                setEvent((event) => {
                                    if (!event) {
                                        return event;
                                    }

                                    return {
                                        ...event,
                                        hasCheckIn: e.target.checked,
                                    };
                                });
                            }}
                        ></CheckBoxWithLabel>
                    </div>

                    <div className="flex items-center gap-2">
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
                                type="button"
                                onClick={deleteEvent}
                                disabled={
                                    checkIns.isLoading ||
                                    hasCheckIns ||
                                    deleteApi.isPending
                                }
                                size={'compact'}
                                hierarchy={'primary'}
                                variant={'caution'}
                            >
                                Delete
                            </Button>
                        )}
                    </div>
                </form>
            </SideDrawer>
        </>
    );
}

function convertEvent(hackathonId: number, e?: InternalCalendarEventType) {
    if (e) {
        const { startTime, endTime, ...rest } = e;
        return {
            ...rest,
            startDate: startTime.toDate(),
            endDate: endTime.toDate(),
        } as CalendarEvent;
    } else {
        return {
            color: '#6466F1',
            hackathonId: hackathonId,
            title: '',
            location: '',
            description: '',
            eventType: EventType.EVENT,
            hasCheckIn: false,
        } as CalendarEvent;
    }
    return {} as CalendarEvent;
}
