'use client';

import { useCallback, useState } from 'react';
import { MegaphoneIcon } from '@heroicons/react/24/solid';
import { useAtomValue, useSetAtom } from 'jotai';
import {
    announcementsAtom,
    hackathonAtom,
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
    const hackathon = useAtomValue(hackathonAtom);
    const fallbackAnnouncements = useAtomValue(announcementsAtom);
    const setLastSeenAt = useSetAtom(lastSeenAtAtom);
    const markSeen = trpc.announcements.markSeen.useMutation();

    const { data } = trpc.announcements.getAnnouncements.useInfiniteQuery(
        { hackathonId: hackathon?.id ?? 0, limit: 10 },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
            initialCursor: undefined,
            enabled: !!hackathon?.id,
        }
    );

    const markAllSeenUpToLatest = useCallback(() => {
        const fromQuery = data?.pages.flatMap((p) => p.items) ?? [];
        const list = fromQuery.length > 0 ? fromQuery : fallbackAnnouncements;
        const ts =
            list.length > 0
                ? new Date(
                      Math.max(...list.map((a) => +new Date(a.sourceTimestamp)))
                  )
                : new Date();
        setLastSeenAt(ts);
        markSeen.mutate({ lastSeenAt: ts });
    }, [data, fallbackAnnouncements, markSeen, setLastSeenAt]);

    function handleOpenChange(next: boolean) {
        if (!next && open) {
            markAllSeenUpToLatest();
        }
        setOpen(next);
    }

    function closePopover() {
        markAllSeenUpToLatest();
        setOpen(false);
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
                    <MegaphoneIcon className="h-6 w-6 transition-colors duration-150" />
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
                className="shadow-4xl z-200 w-[583px] max-w-[min(583px,calc(100vw-2rem))] overflow-hidden p-0"
            >
                <AnnouncementsPopoverContent onClose={closePopover} />
                <PopoverPrimitive.Arrow className="fill-neutral-850 shadow-lg" />
            </PopoverContent>
        </Popover>
    );
}
