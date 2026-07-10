'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const FIELD_BASE =
    'flex h-11 w-full items-center rounded-lg border border-neutral-600/40 bg-neutral-900 px-3 text-sm text-white transition-colors placeholder:text-white/30 hover:border-neutral-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';

export const TextField = forwardRef<
    HTMLInputElement,
    React.ComponentProps<'input'>
>(({ className, ...props }, ref) => (
    <input ref={ref} className={cn(FIELD_BASE, className)} {...props} />
));
TextField.displayName = 'TextField';

export function LazyTextField({
    value,
    onCommit,
    className,
    ...props
}: {
    value: string;
    onCommit: (value: string) => void;
} & Omit<
    React.ComponentProps<'input'>,
    'value' | 'onChange' | 'onBlur' | 'onFocus'
>) {
    const [local, setLocal] = useState(value);
    const focused = useRef(false);
    useEffect(() => {
        if (!focused.current) setLocal(value);
    }, [value]);
    return (
        <input
            {...props}
            className={cn(FIELD_BASE, className)}
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onFocus={() => {
                focused.current = true;
            }}
            onBlur={() => {
                focused.current = false;
                if (local !== value) onCommit(local);
            }}
        />
    );
}

function pad(n: number) {
    return String(n).padStart(2, '0');
}

function datePartToDate(value: string): Date | undefined {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return undefined;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function dateToDatePart(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function timePart(value: string): string {
    const m = /T(\d{2}:\d{2})/.exec(value);
    return m ? m[1] : '';
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function parse24(hhmm: string) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
    if (!m) return null;
    const hour24 = Number(m[1]);
    const minute = Number(m[2]);
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return { hour12, minute, period } as const;
}

function to24(hour12: number, minute: number, period: string): string {
    const hour24 = period === 'PM' ? (hour12 % 12) + 12 : hour12 % 12;
    return `${pad(hour24)}:${pad(minute)}`;
}

function ScrollColumn<T extends string | number>({
    label,
    items,
    selected,
    format = (v) => String(v),
    onPick,
}: {
    label: string;
    items: readonly T[];
    selected: T | undefined;
    format?: (value: T) => string;
    onPick: (value: T) => void;
}) {
    return (
        <div className="flex flex-col">
            <span className="mb-1 text-center text-[10px] tracking-wide text-white/40 uppercase">
                {label}
            </span>
            <div className="no-scrollbar flex max-h-40 flex-col gap-0.5 overflow-y-auto pr-1">
                {items.map((item) => {
                    const active = selected === item;
                    return (
                        <button
                            key={String(item)}
                            type="button"
                            onClick={() => onPick(item)}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-center text-sm transition-colors',
                                active
                                    ? 'bg-brand-600 font-medium text-white'
                                    : 'text-white/70 hover:bg-neutral-700 hover:text-white'
                            )}
                        >
                            {format(item)}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function TimeColumns({
    value,
    onChange,
}: {
    value: string;
    onChange: (hhmm: string) => void;
}) {
    const parsed = parse24(value);
    const set = (hour12: number, minute: number, period: string) =>
        onChange(to24(hour12, minute, period));

    return (
        <div className="flex justify-center gap-1">
            <ScrollColumn
                label="Hour"
                items={HOURS}
                selected={parsed?.hour12}
                format={(h) => pad(h)}
                onPick={(h) =>
                    set(h, parsed?.minute ?? 0, parsed?.period ?? 'AM')
                }
            />
            <ScrollColumn
                label="Min"
                items={MINUTES}
                selected={parsed?.minute}
                format={(m) => pad(m)}
                onPick={(m) =>
                    set(parsed?.hour12 ?? 12, m, parsed?.period ?? 'AM')
                }
            />
            <ScrollColumn
                label=""
                items={['AM', 'PM'] as const}
                selected={parsed?.period}
                onPick={(p) =>
                    set(parsed?.hour12 ?? 12, parsed?.minute ?? 0, p)
                }
            />
        </div>
    );
}

function TimePicker({
    value,
    onChange,
}: {
    value: string;
    onChange: (hhmm: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [open]);

    const label = value
        ? dayjs(`2000-01-01T${value}`).format('h:mm A')
        : 'Set time';

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={cn(
                    'flex h-9 w-32 items-center justify-between rounded-md border border-neutral-600/40 bg-neutral-900 px-3 text-sm transition-colors hover:border-neutral-500',
                    'focus:border-brand-500 focus:ring-brand-500/40 focus:ring-2 focus:outline-none',
                    open && 'border-brand-500 ring-brand-500/40 ring-2'
                )}
            >
                <span className={cn(value ? 'text-white' : 'text-white/30')}>
                    {label}
                </span>
                <Clock className="ml-2 h-4 w-4 shrink-0 text-white/40" />
            </button>
            {open && (
                <div className="bg-neutral-850 absolute top-full right-0 z-20 mt-1 rounded-lg border border-neutral-600/40 p-3 shadow-xl shadow-black/40">
                    <TimeColumns value={value} onChange={onChange} />
                </div>
            )}
        </div>
    );
}

interface DateFieldProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    withTime?: boolean;
    placeholder?: string;
    disabled?: boolean;
}

export function DateField({
    id,
    value,
    onChange,
    withTime = false,
    placeholder = withTime ? 'Pick a date and time' : 'Pick a date',
    disabled = false,
}: DateFieldProps) {
    const [open, setOpen] = useState(false);
    const selectedDate = datePartToDate(value);
    const time = timePart(value);

    const display = value
        ? withTime && time
            ? dayjs(value).format('MMM D, YYYY · h:mm A')
            : dayjs(datePartToDate(value)).format('MMM D, YYYY')
        : '';

    const handleDaySelect = (day: Date | undefined) => {
        if (!day) return;
        const datePart = dateToDatePart(day);
        if (withTime) {
            onChange(`${datePart}T${time || '00:00'}`);
        } else {
            onChange(datePart);
            setOpen(false);
        }
    };

    const handleTimeChange = (newTime: string) => {
        const datePart = value
            ? value.slice(0, 10)
            : dateToDatePart(new Date());
        onChange(newTime ? `${datePart}T${newTime}` : datePart);
    };

    const clear = () => {
        onChange('');
        setOpen(false);
    };

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                if (!disabled) setOpen(next);
            }}
        >
            <PopoverTrigger asChild>
                <button
                    id={id}
                    type="button"
                    disabled={disabled}
                    className={cn(
                        FIELD_BASE,
                        'justify-between text-left',
                        'data-[state=open]:border-brand-500 data-[state=open]:ring-brand-500/40 data-[state=open]:ring-2'
                    )}
                >
                    <span className={cn(!display && 'text-white/30')}>
                        {display || placeholder}
                    </span>
                    <CalendarIcon className="ml-2 h-4 w-4 shrink-0 text-white/40" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-auto border border-neutral-600/40 p-0 text-white"
            >
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    defaultMonth={selectedDate}
                    onSelect={handleDaySelect}
                />
                {withTime && (
                    <div className="flex items-center justify-between gap-3 border-t border-neutral-700/50 p-3">
                        <span className="text-xs text-white/50">
                            Time (PST/PDT)
                        </span>
                        <TimePicker
                            value={time}
                            onChange={(t) => handleTimeChange(t)}
                        />
                    </div>
                )}
                <div className="flex justify-end border-t border-neutral-700/50 p-2">
                    <button
                        type="button"
                        onClick={clear}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/50 transition-colors hover:bg-neutral-700 hover:text-white"
                    >
                        <X className="h-3 w-3" /> Clear
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
