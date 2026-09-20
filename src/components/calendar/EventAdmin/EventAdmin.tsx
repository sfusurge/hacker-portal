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
import { trpc } from '@/trpc/client';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
} from '@/components/ui/select';
import { EVENT_TYPES, EventType } from '@/db/schema/events';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { cn } from '@/lib/utils';

export interface EventAdminProps {
    eventsAtom: PrimitiveAtom<InternalCalendarEventType[]>;
}
export const editModeAtom = atom(false);

const eventFormLabelClassName = 'font-normal text-[var(--text-secondary)]';

const eventDateInputClassName =
    'peer focus:border-brand-500 h-11 w-full rounded-md border border-[var(--border-neutral-secondary)] bg-[var(--background-neutral-secondary)] px-3 py-2 pl-10 text-sm text-[var(--text-secondary)] transition-colors outline-none [&::-webkit-calendar-picker-indicator]:opacity-0';

const emptyEventDateInputClassName =
    'text-transparent focus:text-[var(--text-secondary)] [&::-webkit-datetime-edit]:text-transparent focus:[&::-webkit-datetime-edit]:text-[var(--text-secondary)]';

type EventDateInputProps = {
    name: string;
    value: string;
    required?: boolean;
    onChange: (value: string) => void;
};

export function EventAdmin({ eventsAtom }: EventAdminProps) {
    const [_selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
    const [, setEvents] = useAtom(eventsAtom);
    const [editMode, setEditMode] = useAtom(editModeAtom);

    const [event, setEvent] = useState<CalendarEvent>();

    const hackathon = useAtomValue(hackathonAtom);
    const hackathonsFetch = trpc.hackathons.getHackathons.useQuery();
    const hackathonOptions = hackathonsFetch.data ?? [hackathon];
    const selectedHackathonName =
        hackathonOptions.find((option) => option.id === event?.hackathonId)
            ?.name ?? hackathon.name;

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
                <h1 className="mb-4 font-sans text-lg leading-tight font-semibold tracking-tighter text-white">
                    {_selectedEvent ? 'Edit event' : 'Create new event'}
                </h1>
                <form onSubmit={saveEvent} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <Label className={eventFormLabelClassName}>
                            Event name
                        </Label>
                        <FormTextInput
                            name="title"
                            placeholder="Event Title"
                            type="text"
                            defaultValue={event?.title ?? ''}
                            required
                            lazy
                            onLazyChange={(txt) => {
                                updateEvent('title', txt);
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className={eventFormLabelClassName}>
                            Major Event
                        </Label>
                        <Select
                            value={String(event?.hackathonId ?? hackathon.id)}
                            disabled={Boolean(_selectedEvent)}
                            onValueChange={(hackathonId) => {
                                updateEvent('hackathonId', Number(hackathonId));
                            }}
                        >
                            <SelectTrigger className="h-11 w-full disabled:opacity-100">
                                <span className="flex items-center gap-2">
                                    <span className="bg-brand-500 size-1.5 rounded-full" />
                                    {selectedHackathonName}
                                </span>
                            </SelectTrigger>
                            <SelectContent className="z-[9999] bg-neutral-800 text-white">
                                <SelectGroup>
                                    <SelectLabel>Major Event</SelectLabel>
                                    {hackathonOptions.map((option) => {
                                        return (
                                            <SelectItem
                                                key={option.id}
                                                value={String(option.id)}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className="bg-brand-500 size-1.5 rounded-full" />
                                                    {option.name}
                                                </span>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className={eventFormLabelClassName}>
                            Event Category
                        </Label>
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
                            <SelectTrigger className="h-11 w-full">
                                <span className="flex items-center gap-2">
                                    <span
                                        className="size-1.5 rounded-full"
                                        style={{
                                            backgroundColor:
                                                event?.color ?? '#6466F1',
                                        }}
                                    />
                                    {event?.eventType ?? EventType.EVENT}
                                </span>
                            </SelectTrigger>
                            <SelectContent className="z-[9999] bg-neutral-800 text-white">
                                <SelectGroup>
                                    <SelectLabel>Event category</SelectLabel>
                                    {EVENT_TYPES.map((eventType) => {
                                        return (
                                            <SelectItem
                                                key={eventType}
                                                value={eventType}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span
                                                        className="size-1.5 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                event?.color ??
                                                                '#6466F1',
                                                        }}
                                                    />
                                                    {eventType}
                                                </span>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border-t border-[var(--border-neutral-tertiary)]" />

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <Label required className={eventFormLabelClassName}>
                                Start date
                            </Label>
                            <EventDateInput
                                name="startDate"
                                value={
                                    event?.startDate
                                        ? dayjs(event.startDate).format(
                                              'YYYY-MM-DDTHH:mm:ss'
                                          )
                                        : ''
                                }
                                required
                                onChange={(t) => {
                                    updateEvent(
                                        'startDate',
                                        dayjs(new Date(t)).toDate()
                                    );
                                }}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label required className={eventFormLabelClassName}>
                                End date
                            </Label>
                            <EventDateInput
                                name="endDate"
                                value={
                                    event?.endDate
                                        ? dayjs(event.endDate).format(
                                              'YYYY-MM-DDTHH:mm:ss'
                                          )
                                        : ''
                                }
                                required
                                onChange={(t) => {
                                    updateEvent(
                                        'endDate',
                                        dayjs(new Date(t)).toDate()
                                    );
                                }}
                            />
                        </div>
                    </div>

                    <div className="border-t border-[var(--border-neutral-tertiary)]" />

                    <div className="flex flex-col gap-3">
                        <Label className={eventFormLabelClassName}>
                            Event description (Optional)
                        </Label>
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

                    <div className="flex items-center justify-between gap-3 pt-2">
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
                        <div className="ml-auto flex items-center gap-3">
                            <Button
                                type="button"
                                size="compact"
                                hierarchy="secondary"
                                variant="default"
                                onClick={() => {
                                    setEditMode(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="compact"
                                hierarchy="primary"
                                variant="brand"
                            >
                                {_selectedEvent ? 'Save edit' : 'Create event'}
                            </Button>
                        </div>
                    </div>
                </form>
            </SideDrawer>
        </>
    );
}

function EventDateInput({
    name,
    value,
    required,
    onChange,
}: EventDateInputProps) {
    const empty = !value;

    return (
        <div className="relative">
            <CalendarIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
                name={name}
                type="datetime-local"
                value={value}
                required={required}
                onClick={(e) => {
                    e.currentTarget.showPicker?.();
                }}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
                className={cn(
                    eventDateInputClassName,
                    empty && emptyEventDateInputClassName
                )}
            />
            {empty && (
                <span className="pointer-events-none absolute top-1/2 left-10 -translate-y-1/2 text-sm text-[var(--text-secondary)] peer-focus:hidden">
                    Pick a date
                </span>
            )}
        </div>
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
            points: 1,
        } as CalendarEvent;
    }
    return {} as CalendarEvent;
}
