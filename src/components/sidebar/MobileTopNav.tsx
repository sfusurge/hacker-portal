'use client';

import Image from 'next/image';
import clsx from 'clsx';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { NavLink } from './NavLink';
import {
    UserIcon,
    ArrowLeftEndOnRectangleIcon,
} from '@heroicons/react/24/outline';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { signOut } from 'next-auth/react';
import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

import { UserData } from '@/server/routers/usersRouter';
import { getIcon } from '@/utils/blobHelper';

interface MobileTopNavProps {
    className?: string;
    initialData?: UserData;
}

const excludedUrls = ['/application', '/admin/qr'];

export default function MobileTopNav({
    initialData,
    className,
}: MobileTopNavProps) {
    const [hideTopNav, setHideTopNav] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const url = usePathname();

    const avatarUrl = useMemo(() => {
        if (initialData && initialData.image) {
            return getIcon('user_icon', initialData.image);
        }
        return '/sidebar/default-avatar.webp';
    }, [initialData]);

    useEffect(() => {
        for (const excludeURL of excludedUrls) {
            if (url.startsWith(excludeURL)) {
                document.body.style.setProperty('--paddingTop', '0rem');
                return setHideTopNav(true);
            }
            setHideTopNav(false);
            document.body.style.setProperty('--paddingTop', '5rem');
        }
    }, [url]);

    return (
        <>
            {!hideTopNav && (
                <div
                    className={clsx(
                        'h-20 w-screen border-b border-b-neutral-600/30 bg-neutral-900/60 px-4 py-5 backdrop-blur-xl',
                        className
                    )}
                >
                    <div className="flex w-full flex-row items-center justify-between">
                        <div className="my-auto flex flex-row gap-3">
                            <Image
                                src="/dashboard/sh25head.png"
                                alt="StormHacks 2025 Logo"
                                width={36}
                                height={36}
                                className="h-9 w-9 rounded-lg"
                            />

                            <div className="flex flex-col gap-2">
                                <span
                                    className="line-clamp-1 text-sm leading-none font-medium text-white hover:text-white/80"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                        try {
                                            const prev =
                                                localStorage.getItem(
                                                    'timeShift.visible'
                                                ) === 'true';
                                            localStorage.setItem(
                                                'timeShift.visible',
                                                prev ? 'false' : 'true'
                                            );
                                        } catch (e) {
                                            console.error(
                                                'DesktopNav: Failed to toggle timeShift.visible',
                                                e
                                            );
                                        }
                                        try {
                                            window.dispatchEvent(
                                                new Event('timeShift-toggle')
                                            );
                                        } catch (e) {
                                            console.error(
                                                'DesktopNav: Failed to dispatch timeShift-toggle',
                                                e
                                            );
                                        }
                                    }}
                                >
                                    StormHacks 2025
                                </span>
                                <span className="line-clamp-1 text-sm leading-none text-white/60">
                                    October 4–5, 2025
                                </span>
                            </div>
                        </div>

                        <Popover
                            open={popoverOpen}
                            onOpenChange={setPopoverOpen}
                        >
                            <PopoverTrigger asChild>
                                <button className="rounded-full focus:ring-2 focus:ring-white/20 focus:outline-none">
                                    <img
                                        alt="Default avatar for the user"
                                        src={avatarUrl}
                                        className="aspect-square h-10 w-10 rounded-full"
                                    />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent
                                sideOffset={8}
                                side="bottom"
                                align="end"
                                className="z-200"
                            >
                                <NavLink
                                    href="/profile"
                                    label="Edit profile"
                                    icon={
                                        <UserIcon className="h-6 w-6 text-white/60" />
                                    }
                                    className="px-2"
                                    iconAlt="Profile"
                                    platform="desktop"
                                    active={url.startsWith('/profile')}
                                    onClick={() => setPopoverOpen(false)}
                                />
                                <NavLink
                                    href="#"
                                    label="Sign out"
                                    icon={
                                        <ArrowLeftEndOnRectangleIcon></ArrowLeftEndOnRectangleIcon>
                                    }
                                    iconAlt="Sign out logo"
                                    platform="desktop"
                                    variant="error"
                                    className="px-2"
                                    onClick={async () => {
                                        setPopoverOpen(false);
                                        await signOut();
                                        if (typeof window !== 'undefined') {
                                            localStorage.removeItem(
                                                'auth-login-success'
                                            );
                                        }
                                    }}
                                ></NavLink>
                                <PopoverPrimitive.Arrow className="fill-neutral-850 mr-4 shadow-lg" />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            )}
        </>
    );
}
