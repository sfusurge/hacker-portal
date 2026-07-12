'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn('p-3', className)}
            classNames={{
                months: 'flex flex-col sm:flex-row gap-4',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-medium text-white',
                nav: 'space-x-1 flex items-center',
                nav_button:
                    'inline-flex h-7 w-7 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-neutral-700 hover:text-white',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell:
                    'text-white/40 rounded-md w-9 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'h-9 w-9 text-center text-sm p-0 relative',
                day: 'inline-flex h-9 w-9 items-center justify-center rounded-md p-0 font-normal text-white/80 transition-colors hover:bg-neutral-700 hover:text-white aria-selected:opacity-100',
                day_selected:
                    'bg-brand-600 text-white hover:bg-brand-600 hover:text-white focus:bg-brand-600',
                day_today: 'border border-brand-500/50 text-white',
                day_outside: 'text-white/25',
                day_disabled: 'text-white/20 opacity-50',
                day_hidden: 'invisible',
                ...classNames,
            }}
            components={{
                IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                IconRight: () => <ChevronRight className="h-4 w-4" />,
            }}
            {...props}
        />
    );
}
Calendar.displayName = 'Calendar';

export { Calendar };
