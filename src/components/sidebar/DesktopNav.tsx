'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { NavLink } from './NavLink';
import { HomeIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/outline';
import {
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { MergedUserData } from '@/app/(auth)/layout';
import { signOut } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface DesktopNavProps {
    className?: string;
    initialData?: MergedUserData;
}

export default function DesktopNav({
    className,
    initialData,
}: DesktopNavProps) {
    const [manuallyCollapsed, setManuallyCollapsed] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const returnHome = () => {
        redirect('/home');
    };
    const url = usePathname();

    useEffect(() => {
        setIsTransitioning(true);
        const timer = setTimeout(() => setIsTransitioning(false), 200);
        return () => clearTimeout(timer);
    }, [manuallyCollapsed]);

    return (
        <div
            className={clsx(
                'h-screen bg-neutral-950 p-5 transition-all duration-200 relative',
                manuallyCollapsed ? 'max-w-[80px]' : 'max-w-[300px]',
                className
            )}
        >
            <button
                onClick={() => setManuallyCollapsed(!manuallyCollapsed)}
                className="flex absolute -right-3 top-8 bg-neutral-950 rounded-lg p-1 hover:bg-neutral-900 transition-colors"
                aria-label={
                    manuallyCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                }
            >
                {manuallyCollapsed ? (
                    <ChevronDoubleRightIcon className="w-5 h-5 text-white" />
                ) : (
                    <ChevronDoubleLeftIcon className="w-5 h-5 text-white" />
                )}
            </button>

            <div className="flex flex-col h-full justify-between">
                <div className="flex flex-col gap-5">
                    {!manuallyCollapsed ? (
                        <div className="relative aspect-[5/3] rounded-xl overflow-hidden border border-neutral-800">
                            <div className="absolute top-0 bg-neutral-900/50 backdrop-blur-lg flex flex-row gap-3 w-full p-2 items-center">
                                <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
                                    <Image
                                        src="/login/sparkcheffrizz.webp"
                                        alt="Sparky wearing a chef's hat"
                                        width={36}
                                        height={36}
                                        className="rounded-lg w-full h-full object-cover pointer-events-none"
                                        onClick={returnHome}
                                    />
                                </div>
                                <div
                                    className={clsx(
                                        'flex flex-col gap-2 overflow-hidden transition-all duration-200 origin-left',
                                        manuallyCollapsed
                                            ? 'scale-x-0 opacity-0'
                                            : 'scale-x-100 opacity-100'
                                    )}
                                >
                                    <span className="text-sm font-medium leading-none text-white line-clamp-1 whitespace-nowrap">
                                        JourneyHacks 2025
                                    </span>
                                    <span className="text-sm leading-none text-white/60 line-clamp-1 whitespace-nowrap">
                                        February 14, 2025
                                    </span>
                                </div>
                            </div>
                            <Image
                                src="/dashboard/sidebar-header.webp"
                                alt="Stormy and Sparky cooking"
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
                            <Image
                                src="/login/sparkcheffrizz.webp"
                                alt="Sparky wearing a chef's hat"
                                width={36}
                                height={36}
                                className="rounded-lg w-full h-full object-cover pointer-events-none"
                                onClick={returnHome}
                            />
                        </div>
                    )}

                    <div className="links flex-1 flex flex-col gap-1">
                        <NavLink
                            href="/home"
                            label="Home"
                            icon={<HomeIcon className="w-6 h-6" />}
                            iconAlt="Home logo"
                            platform="desktop"
                            active={url.startsWith('/home')}
                            className={clsx({
                                'justify-center': manuallyCollapsed,
                            })}
                        />
                        <NavLink
                            href="/teams"
                            label="Teams"
                            icon={<UserGroupIcon className="w-6 h-6" />}
                            iconAlt="Teams logo"
                            platform="desktop"
                            active={url.startsWith('/teams')}
                            disabled={true}
                            className={clsx({
                                'justify-center': manuallyCollapsed,
                            })}
                        />
                        <NavLink
                            href="/schedule"
                            label="Schedule"
                            icon={<CalendarDaysIcon className="w-6 h-6" />}
                            iconAlt="Schedule logo"
                            platform="desktop"
                            active={url.startsWith('/schedule')}
                            disabled={true}
                            className={clsx({
                                'justify-center': manuallyCollapsed,
                            })}
                        />
                        <NavLink
                            href="/notifications"
                            label="Notifications"
                            icon={<BellAlertIcon className="w-6 h-6" />}
                            iconAlt="Notifications logo"
                            platform="desktop"
                            active={url.startsWith('/notifications')}
                            disabled={true}
                            className={clsx({
                                'justify-center': manuallyCollapsed,
                            })}
                        />
                        {initialData?.userRole === 'admin' && (
                            <NavLink
                                href="/admin/reviewapplications"
                                label="Review Applications"
                                icon={<BellAlertIcon className="w-6 h-6" />}
                                iconAlt="Review Applications logo"
                                platform="desktop"
                                active={url.startsWith(
                                    '/admin/reviewapplications'
                                )}
                                className={clsx({
                                    'justify-center': manuallyCollapsed,
                                })}
                            />
                        )}
                    </div>
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <button className="group flex flex-row justify-between items-center hover:bg-neutral-750/30 rounded-lg px-3 py-2.5 gap-5 transition-colors">
                            <div className="flex flex-row gap-4 items-center justify-center w-full">
                                <div className="w-9 h-9 flex-shrink-0">
                                    <img
                                        alt="Default avatar for the user"
                                        src={
                                            initialData?.image ??
                                            '/sidebar/default-avatar.webpp'
                                        }
                                        width={36}
                                        height={36}
                                        className="rounded-full w-full h-full object-cover"
                                    />
                                </div>
                                <div
                                    className={clsx(
                                        'flex flex-col gap-2 overflow-hidden transition-all duration-200 origin-left',
                                        manuallyCollapsed
                                            ? 'scale-x-0 opacity-0'
                                            : 'scale-x-100 opacity-100'
                                    )}
                                >
                                    <span className="text-white font-medium text-base leading-tight text-left line-clamp-1 whitespace-nowrap">
                                        {initialData?.firstName}{' '}
                                        {initialData?.lastName}
                                    </span>
                                    <span className="text-white/60 text-sm leading-none text-left line-clamp-1 whitespace-nowrap">
                                        {initialData?.userRole === 'user'
                                            ? 'Hacker'
                                            : 'Admin'}
                                    </span>
                                </div>
                            </div>
                            <ChevronDoubleRightIcon
                                width={28}
                                height={28}
                                className={clsx(
                                    'text-white/60 group-hover:text-white transition-all duration-200',
                                    manuallyCollapsed
                                        ? 'scale-x-0 opacity-0'
                                        : 'scale-x-100 opacity-100'
                                )}
                            />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent sideOffset={8} side="right">
                        <NavLink
                            href="#"
                            label="Sign out"
                            icon={
                                <ArrowLeftEndOnRectangleIcon className="w-6 h-6" />
                            }
                            iconAlt="Sign out logo"
                            platform="desktop"
                            variant="error"
                            className="px-2"
                            onClick={async () => {
                                await signOut({
                                    redirectTo: '/login',
                                });
                            }}
                        />
                        <PopoverPrimitive.Arrow className="fill-neutral-850 shadow-lg" />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
