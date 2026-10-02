'use client';

import type { Dayjs } from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DayContentProps } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

function DayContent({ date, activeModifiers }: DayContentProps) {
    const inRange = activeModifiers.hackathon && !activeModifiers.outside;

    return (
        <>
            <span
                className={cn(
                    'group-focus-visible:ring-brand-500 relative z-10 inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors group-focus-visible:ring-2',
                    activeModifiers.selected
                        ? 'bg-brand-600 text-white'
                        : 'group-hover:bg-neutral-700'
                )}
            >
                {date.getDate()}
            </span>
            {inRange && (
                <span
                    aria-hidden
                    className={cn(
                        'bg-brand-600 absolute bottom-0 h-1',
                        activeModifiers.hackathonStart
                            ? 'left-[calc(50%-0.875rem)] rounded-l-full'
                            : 'left-0',
                        activeModifiers.hackathonEnd
                            ? 'right-[calc(50%-0.875rem)] rounded-r-full'
                            : 'right-0'
                    )}
                />
            )}
        </>
    );
}

export function ScheduleMiniCalendar({
    month,
    selected,
    hackathonStart,
    hackathonEnd,
    onSelect,
    onMonthChange,
}: {
    month: Date;
    selected: Date;
    hackathonStart: Dayjs;
    hackathonEnd: Dayjs;
    onSelect: (date: Date | undefined) => void;
    onMonthChange: (date: Date) => void;
}) {
    return (
        <Calendar
            mode="single"
            month={month}
            selected={selected}
            onSelect={onSelect}
            onMonthChange={onMonthChange}
            hideHead
            fixedWeeks
            modifiers={{
                hackathon: {
                    from: hackathonStart.toDate(),
                    to: hackathonEnd.toDate(),
                },
                hackathonStart: hackathonStart.toDate(),
                hackathonEnd: hackathonEnd.toDate(),
            }}
            className="w-full p-4"
            classNames={{
                months: 'flex flex-col',
                month: 'space-y-3',
                caption: 'flex items-center justify-between',
                caption_label: 'text-lg font-semibold text-white',
                nav: 'flex items-center gap-1',
                nav_button:
                    'focus-visible:ring-brand-500 inline-flex h-7 w-7 items-center justify-center rounded-md text-white transition-colors hover:bg-neutral-700 focus-visible:ring-2 focus-visible:outline-none',
                nav_button_previous: '',
                nav_button_next: '',
                table: 'w-full border-collapse',
                row: 'flex w-full mt-1 first:mt-0',
                cell: 'relative flex-1 p-0 text-center',
                day: 'group relative inline-flex h-8 w-full items-center justify-center p-0 pb-1 text-sm font-normal text-white focus-visible:outline-none',
                day_selected: '',
                day_today: '',
                day_outside: 'text-white/25',
                day_disabled: 'text-white/20 opacity-50',
            }}
            components={{
                IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                IconRight: () => <ChevronRight className="h-4 w-4" />,
                DayContent,
            }}
        />
    );
}
