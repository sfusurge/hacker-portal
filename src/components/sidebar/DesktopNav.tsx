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
import { MergedUserData } from '@/app/(auth)/layout';
import { signOut } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';
import { useState } from 'react';

interface DesktopNavProps {
    className?: string;
    initialData?: MergedUserData;
}

export default function DesktopNav({
    className,
    initialData,
}: DesktopNavProps) {
    const [manuallyCollapsed, setManuallyCollapsed] = useState(false);
    const returnHome = () => {
        redirect('/home');
    };
    const url = usePathname();

    return (
        <div className={clsx('flex flex-col h-full', className)}>
            <div
                className={clsx(
                    'h-full bg-neutral-950 p-5 transition-all duration-200 relative',
                    manuallyCollapsed ? 'w-[80px]' : 'w-[300px]'
                )}
            >
                <div className="flex flex-col h-full justify-between">
                    <div className="flex flex-col gap-5">
                        {!manuallyCollapsed ? (
                            <div className="relative aspect-[5/3] rounded-2xl overflow-hidden border border-neutral-800">
                                <div className="absolute top-0 bg-neutral-900/50 backdrop-blur-lg flex flex-row gap-3 w-full p-3 items-center">
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
                                            'flex flex-col gap-2 overflow-hidden transition-all duration-200 origin-left mt-1',
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
                    <div className="mt-auto pt-5">
                        <button
                            onClick={async () => {
                                await signOut({
                                    redirectTo: '/login',
                                });
                            }}
                            className={clsx(
                                'w-full flex items-center gap-3 rounded-lg h-11 px-3 text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors',
                                manuallyCollapsed
                                    ? 'justify-center'
                                    : 'justify-start'
                            )}
                            aria-label="Sign out"
                        >
                            <div className="w-6 h-6 flex items-center justify-center">
                                <ArrowLeftEndOnRectangleIcon className="w-6 h-6" />
                            </div>
                            {!manuallyCollapsed && (
                                <span className="text-sm font-medium">
                                    Sign Out
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div
                className={clsx(
                    'fixed top-0 h-16 bg-neutral-950 border-b border-neutral-950 flex items-center justify-between px-5 z-50 transition-all duration-200',
                    manuallyCollapsed ? 'left-[80px]' : 'left-[300px]',
                    'right-0'
                )}
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setManuallyCollapsed(!manuallyCollapsed)}
                        className="flex bg-neutral-950 rounded-lg p-1.5 hover:bg-neutral-900 transition-colors"
                        aria-label={
                            manuallyCollapsed
                                ? 'Expand sidebar'
                                : 'Collapse sidebar'
                        }
                    >
                        {manuallyCollapsed ? (
                            <ChevronDoubleRightIcon className="w-5 h-5 text-white/60 hover:text-white" />
                        ) : (
                            <ChevronDoubleLeftIcon className="w-5 h-5 text-white/60 hover:text-white" />
                        )}
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex-shrink-0">
                        <img
                            alt="Default avatar for the user"
                            src={
                                initialData?.image ??
                                '/sidebar/default-avatar.webpp'
                            }
                            width={32}
                            height={32}
                            className="rounded-full w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
