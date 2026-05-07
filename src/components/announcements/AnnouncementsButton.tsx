'use client';

import { useState } from 'react';
import { MegaphoneIcon } from '@heroicons/react/24/solid';
import { useAtomValue, useSetAtom } from 'jotai';
import {
    announcementsAtom,
    unreadCountAtom,
    unreadLabelAtom,
    lastSeenAtAtom,
} from '@/app/(auth)/ClientContext';
import { trpc } from '@/trpc/client';
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
    const unreadLabel = useAtomValue(unreadLabelAtom);
    const announcements = useAtomValue(announcementsAtom);
    const setLastSeenAt = useSetAtom(lastSeenAtAtom);
    const markSeen = trpc.announcements.markSeen.useMutation();

    function handleOpenChange(next: boolean) {
        if (!next && open) {
            // popover closes, mark everything as read up to the latest event
            const latest = announcements[0];
            const ts = latest ? new Date(latest.sourceTimestamp) : new Date();
            setLastSeenAt(ts);
            markSeen.mutate({ lastSeenAt: ts });
        }
        setOpen(next);
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label={`Announcements${unreadCount > 0 ? `, ${unreadLabel} unread` : ''}`}
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
                        <span className="bg-danger-500 absolute -top-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-full px-0.5 text-xs leading-none font-bold text-white">
                            {unreadLabel}
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
