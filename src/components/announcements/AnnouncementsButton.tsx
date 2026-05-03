'use client';

import Link from 'next/link';
import { MegaphoneIcon } from '@heroicons/react/24/solid';
import { useAtomValue } from 'jotai';
import { unreadCountAtom } from '@/app/(auth)/ClientContext';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export function AnnouncementsButton({ className }: { className?: string }) {
    const unreadCount = useAtomValue(unreadCountAtom);

    return (
        <Link
            href="/announcements"
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
        </Link>
    );
}
