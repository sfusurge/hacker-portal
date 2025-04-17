'use client';

import React from 'react';
import { Chip } from '@/components/ui/chip';
import { user } from '@/db/schema/users/users';
import { InferSelectModel } from 'drizzle-orm';
import useMediaQuery from 'beautiful-react-hooks/useMediaQuery';
import { getStatusVariant, ApplicationStatus } from '@/lib/application-status';

type UserType = InferSelectModel<typeof user>;

// Extended props for the placeholder
interface TeammateItemProps extends Partial<UserType> {
    name?: string;
    image?: string;
    currentUser?: boolean;
    index?: number;
    isPlaceholder?: boolean;
    maxMembersCount?: number;
    isLastItem?: boolean;
    currentStatus?: ApplicationStatus;
}

export default function TeammateItem({
    firstName = null,
    lastName = null,
    name,
    email = '',
    image = '/teams/single-otter.webp',
    currentUser = false,
    index = 0,
    isPlaceholder = false,
    maxMembersCount = 4,
    isLastItem = false,
    currentStatus = null,
}: TeammateItemProps) {
    const isMobile = useMediaQuery('(max-width: 767px)');

    // Calculate display name
    const displayName =
        name ||
        ((firstName || '') + ' ' + (lastName || '')).trim() ||
        'Unknown User';

    const statusVariant = getStatusVariant(currentStatus);

    // Placeholder is hidden on mobile
    if (isPlaceholder && isMobile) {
        return null;
    }

    // Placeholder item on desktop
    if (isPlaceholder) {
        return (
            <>
                <li className="h-11"></li>
                {index == maxMembersCount - 1 ||
                    (index !== maxMembersCount - 1 && !isMobile && (
                        <hr className="border-neutral-700/20" />
                    ))}
            </>
        );
    }

    return (
        <>
            <li className="flex justify-between gap-4">
                <div className="flex flex-1 items-center gap-3 overflow-hidden md:gap-4">
                    <img
                        alt={displayName + ' profile picture'}
                        src={image ?? '/teams/single-otter.webp'}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover md:h-11 md:w-11"
                    />
                    <div className="flex flex-1 flex-col justify-around gap-1 overflow-hidden">
                        <p className="truncate text-sm font-medium md:text-base">
                            {isMobile
                                ? firstName || displayName.split(' ')[0]
                                : displayName}{' '}
                            {currentUser && (
                                <span className="font-normal text-white/60">
                                    (You)
                                </span>
                            )}
                        </p>
                        <p className="truncate text-xs font-normal md:text-sm">
                            {email}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-4">
                    <Chip variant={statusVariant}>
                        {currentStatus || 'Not Submitted'}
                    </Chip>
                </div>
            </li>
            {!isLastItem && isMobile && (
                <hr className="border-neutral-700/20" />
            )}
            {index !== maxMembersCount - 1 && !isMobile && (
                <hr className="border-neutral-700/20" />
            )}
        </>
    );
}
