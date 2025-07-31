'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Chip } from '@/components/ui/chip';
import { user } from '@/db/schema/users/users';
import { InferSelectModel } from 'drizzle-orm';
import useMediaQuery from 'beautiful-react-hooks/useMediaQuery';
import {
    getStatusVariant,
    ApplicationStatus,
    getTextVariant,
} from '@/lib/application-status';
import { trpc } from '@/trpc/client';
import { getIcon } from '@/utils/blobHelper';

type UserType = InferSelectModel<typeof user>;

interface TeammateItemProps extends Partial<UserType> {
    name?: string;
    image?: string;
    currentUser?: boolean;
    index?: number;
    isPlaceholder?: boolean;
    maxMembersCount?: number;
}

export default function TeammateItemSubmit({
    id,
    firstName = null,
    lastName = null,
    name,
    email = '',
    image,
    currentUser = false,
    index = 0,
    isPlaceholder = false,
    maxMembersCount = 4,
}: TeammateItemProps) {
    const isMobile = useMediaQuery('(max-width: 767px)');

    const avatarUrl = useMemo(() => {
        if (!image) {
            return '/teams/single-otter.webp';
        }
        return getIcon('user_icon', image);
    }, [image]);

    // Calculate display name
    const displayName =
        name ||
        ((firstName || '') + ' ' + (lastName || '')).trim() ||
        'Unknown User';

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
                <div className="flex flex-1 items-center gap-3 overflow-hidden">
                    <img
                        alt={displayName + ' profile picture'}
                        src={avatarUrl}
                        width={32}
                        height={32}
                        className="h-7 w-7 rounded-full object-cover"
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
                    </div>
                </div>
            </li>
        </>
    );
}
