'use client';

import { useState } from 'react';
import { MegaphoneIcon } from '@heroicons/react/24/solid';
import { useAtomValue } from 'jotai';
import { unreadCountAtom } from '@/app/(auth)/ClientContext';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { AnnouncementsPopoverContent } from './AnnouncementsPopover';

export function AnnouncementsButton({ className }: { className?: string }) {
    const [open, setOpen] = useState(false);
    const unreadCount = useAtomValue(unreadCountAtom);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label={`Announcements${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                    className={cn(
                        buttonVariants({
                            variant: 'default',
                            hierarchy: 'primary',
                            size: 'iconButton',
                        }),
                        'relative hidden md:flex',
                        className
                    )}
                >
                    <MegaphoneIcon className="h-6 w-6" />
                    {unreadCount > 0 && (
                        <span className="bg-danger-500 absolute -top-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-full px-0.5 text-sm leading-none font-bold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent
                side="bottom"
                align="end"
                alignOffset={-15}
                className="z-200 w-[583px] max-w-[min(583px,calc(100vw-2rem))] overflow-hidden p-0 backdrop-blur-3xl"
            >
                <AnnouncementsPopoverContent onClose={() => setOpen(false)} />
                <PopoverPrimitive.Arrow className="fill-neutral-850 shadow-lg" />
            </PopoverContent>
        </Popover>
    );
}
