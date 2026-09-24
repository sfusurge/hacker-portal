import { CalendarEvent } from '@/server/routers/eventsRouter';
import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    DayjsifyEvents,
    editModeAtom,
    InternalCalendarEventType,
    selectEventAtom,
    selectedEventAtom,
} from '../MonthCalendarShared';
import { SideDrawer } from '@/components/ui/SideDrawer/SideDrawer';
import { type FormEvent, useEffect, useRef, useState } from 'react';
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
import { submitFile } from '@/lib/blobs';
import { CheckBoxWithLabel } from '@/components/ui/checkbox/checkboxWithLabel';

export interface EventAdminProps {
    eventsAtom: PrimitiveAtom<InternalCalendarEventType[]>;
}

const eventFormLabelClassName = 'font-normal text-[var(--text-secondary)]';

const eventDateInputClassName =
    'peer focus:border-brand-500 h-11 w-full rounded-md border border-[var(--border-neutral-secondary)] bg-[var(--background-neutral-secondary)] px-3 py-2 pl-10 text-sm text-[var(--text-secondary)] transition-colors outline-none [&::-webkit-calendar-picker-indicator]:opacity-0';

const emptyEventDateInputClassName =
    'text-transparent focus:text-[var(--text-secondary)] [&::-webkit-datetime-edit]:text-transparent focus:[&::-webkit-datetime-edit]:text-[var(--text-secondary)]';

const checkerboardBackground = {
    background:
        'repeating-conic-gradient(#f0f0f0 0 25%, #fff 0 50%) 0 0 / 16px 16px',
};

type EventDateInputProps = {
    name: string;
    value: string;
    required?: boolean;
    onChange: (value: string) => void;
};

type EventImageUploadProps = {
    previewUrl?: string;
    onFileChange: (file?: File) => void;
};

export function EventAdmin({ eventsAtom }: EventAdminProps) {
    const _selectedEvent = useAtomValue(selectedEventAtom);
    const clearSelectedEvent = useSetAtom(selectEventAtom);
    const [, setEvents] = useAtom(eventsAtom);
    const [editMode, setEditMode] = useAtom(editModeAtom);

    const [event, setEvent] = useState<CalendarEvent>();
    const [imageFile, setImageFile] = useState<File>();
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string>();

    const hackathon = useAtomValue(hackathonAtom);
    const trpcUtils = trpc.useUtils();
    const hackathonsFetch = trpc.hackathons.getHackathons.useQuery();
    const hackathonOptions = hackathonsFetch.data ?? [hackathon];
    const selectedHackathonName =
        hackathonOptions.find((option) => option.id === event?.hackathonId)
            ?.name ?? hackathon.name;
    const isDeadline = event?.isDeadline ?? false;

    useEffect(() => {
        setEvent(convertEvent(hackathon.id, _selectedEvent?.event));
        setImageFile(undefined);
    }, [hackathon?.id, _selectedEvent?.event]);

    useEffect(() => {
        if (!imageFile) {
            setImagePreviewUrl(undefined);
            return;
        }

        const url = URL.createObjectURL(imageFile);
        setImagePreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [imageFile]);

    const longDescriptionFetch = trpc.events.getEventLongDescription.useQuery(
        {
            eventId: event?.id ?? -1,
        },
        {
            enabled: Boolean(event?.id),
        }
    );
    const [longDescription, setLongDescription] = useState('');
    useEffect(() => {
        if (!event?.id) {
            setLongDescription('');
            return;
        }

        setLongDescription(longDescriptionFetch.data?.longDescription ?? '');
    }, [event?.id, longDescriptionFetch.data]);

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

    function updateDeadlineMode(isDeadline: boolean) {
        setEvent((current) => {
            if (!current) {
                return current;
            }

            return {
                ...current,
                isDeadline,
                color: isDeadline ? '#EAB308' : current.color,
                endDate: isDeadline ? current.startDate : current.endDate,
                hasCheckIn: isDeadline ? false : current.hasCheckIn,
                variablePoints: isDeadline ? false : current.variablePoints,
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
        const isDeadline = event.isDeadline;
        const startDate = dayjs(new Date(getValue('startDate'))).toDate();
        const endDate = isDeadline
            ? startDate
            : dayjs(new Date(getValue('endDate'))).toDate();
        const description = isDeadline
            ? ''
            : formData.has('description')
              ? getValue('description')
              : (event.description ?? '');
        let imageUrl = isDeadline ? undefined : event.imageUrl;

        if (!isDeadline && imageFile) {
            const extension = imageFile.name.slice(
                imageFile.name.lastIndexOf('.')
            );
            const blob = await submitFile({
                file: imageFile,
                path: `events/hackathon-${event.hackathonId}/event-${crypto.randomUUID()}${extension}`,
                uploadPath: 'event_image',
                contentType: imageFile.type,
            });

            imageUrl = blob.url;
        }

        const submittedEvent = {
            ...event,
            title: getValue('title'),
            description,
            location: isDeadline ? '' : getValue('location'),
            imageUrl,
            startDate,
            endDate,
        };
        const submittedLongDescription = isDeadline
            ? ''
            : getValue('longDescription');
        let savedEventId = submittedEvent.id;

        if (!_selectedEvent) {
            const createdEvent = await createEventApi.mutateAsync({
                ...submittedEvent,
                startDate: submittedEvent.startDate.getTime(),
                endDate: submittedEvent.endDate.getTime(),
                longDescription: submittedLongDescription,
            });
            savedEventId = createdEvent.id;
        } else {
            await updateEventapi.mutateAsync({
                ...submittedEvent,
                eventId: submittedEvent.id!,
                startDate: submittedEvent.startDate?.getTime()!,
                endDate: submittedEvent.endDate?.getTime()!,
                longDescription: submittedLongDescription,
            });
        }

        if (savedEventId) {
            await trpcUtils.events.getEventLongDescription.invalidate({
                eventId: savedEventId,
            });
        }

        setLongDescription(submittedLongDescription);
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
            clearSelectedEvent();
        }
    }, [clearSelectedEvent, editMode]);

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

                                updateEvent(
                                    'eventType',
                                    eventType as EventType
                                );
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

                    <div className="flex flex-col gap-2">
                        <Label className={eventFormLabelClassName}>
                            Calendar display
                        </Label>
                        <CheckBoxWithLabel
                            id="eventIsDeadline"
                            name="Deadline"
                            checked={isDeadline}
                            onChange={(e) => {
                                updateDeadlineMode(e.target.checked);
                            }}
                        />
                    </div>

                    <div className="border-t border-[var(--border-neutral-tertiary)]" />

                    <div
                        className={cn(
                            'grid grid-cols-1 gap-5',
                            !isDeadline && 'sm:grid-cols-2'
                        )}
                    >
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

                        {!isDeadline && (
                            <div className="flex flex-col gap-2">
                                <Label
                                    required
                                    className={eventFormLabelClassName}
                                >
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
                        )}
                    </div>

                    {!isDeadline && (
                        <>
                            <div className="flex flex-col gap-2">
                                <Label
                                    required
                                    className={eventFormLabelClassName}
                                >
                                    Location
                                </Label>
                                <FormTextInput
                                    name="location"
                                    placeholder="Location"
                                    type="text"
                                    defaultValue={event?.location ?? ''}
                                    required
                                    lazy
                                    onLazyChange={(txt) => {
                                        updateEvent('location', txt);
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <Label className={eventFormLabelClassName}>
                                        Has check-in?
                                    </Label>
                                    <CheckBoxWithLabel
                                        id="eventHasCheckIn"
                                        name="Check-in enabled"
                                        checked={event?.hasCheckIn ?? false}
                                        disabled={
                                            checkIns.isLoading || hasCheckIns
                                        }
                                        onChange={(e) => {
                                            updateEvent(
                                                'hasCheckIn',
                                                e.target.checked
                                            );
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label className={eventFormLabelClassName}>
                                        Variable points at check-in?
                                    </Label>
                                    <CheckBoxWithLabel
                                        id="eventVariablePoints"
                                        name="Variable points enabled"
                                        checked={event?.variablePoints ?? false}
                                        onChange={(e) => {
                                            updateEvent(
                                                'variablePoints',
                                                e.target.checked
                                            );
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label className={eventFormLabelClassName}>
                                    {event?.variablePoints
                                        ? 'Max points'
                                        : 'Points'}
                                </Label>
                                <FormTextInput
                                    name="points"
                                    type="number"
                                    min={1}
                                    defaultValue={event?.points ?? 1}
                                    required
                                    lazy
                                    onLazyChange={(value) => {
                                        updateEvent(
                                            'points',
                                            Number.isNaN(value) ? 1 : value
                                        );
                                    }}
                                />
                            </div>
                            <div className="border-t border-[var(--border-neutral-tertiary)]" />

                            <EventImageUpload
                                previewUrl={imagePreviewUrl ?? event?.imageUrl}
                                onFileChange={setImageFile}
                            />

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
                        </>
                    )}

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

function EventImageUpload({ previewUrl, onFileChange }: EventImageUploadProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    return (
        <div className="flex items-start gap-6">
            <div
                className="h-[110px] w-[196px] shrink-0 overflow-hidden rounded-lg"
                style={checkerboardBackground}
            >
                {previewUrl && (
                    <img
                        src={previewUrl}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                )}
            </div>

            <div className="flex min-w-0 flex-col gap-3">
                <Label className={eventFormLabelClassName}>Event image</Label>
                <input
                    ref={inputRef}
                    name="imageFile"
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) => onFileChange(e.target.files?.[0])}
                />
                <Button
                    type="button"
                    size="compact"
                    hierarchy="primary"
                    variant="default"
                    className="w-fit px-3"
                    onClick={() => inputRef.current?.click()}
                >
                    Upload
                </Button>
                <p className="text-xs leading-5 text-[var(--text-secondary)]">
                    .png, .jpeg files up to 16 MB
                    <br />
                    At least 800px x 450px
                </p>
            </div>
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
            variablePoints: false,
            isDeadline: false,
        } as CalendarEvent;
    }
    return {} as CalendarEvent;
}
