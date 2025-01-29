'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { NavLink } from './NavLink';
import { HomeIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
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

interface DesktopNavProps {
    className?: string;
    initialData?: MergedUserData;
}

export default function DesktopNav({
    className,
    initialData,
}: DesktopNavProps) {
    const returnHome = () => {
        redirect('/home');
    };

    const url = usePathname();

    return (
        <div
            className={clsx(
                'h-screen bg-neutral-950 p-5 max-w-[300px]',
                className
            )}
        >
            <div className="flex flex-col h-full justify-between">
                <div className="flex flex-col gap-5">
                    <div className="relative aspect-[5/3] rounded-xl overflow-hidden border border-neutral-800">
                        <div className="absolute top-0 bg-neutral-900/50 backdrop-blur-lg flex flex-row gap-3 w-full p-2">
                            <Image
                                src="/login/sparkcheffrizz.webp"
                                alt="Sparky wearing a chef\'s hat"
                                width={36}
                                height={36}
                                className="rounded-lg w-8 h-8 pointer-events-none"
                                onClick={returnHome}
                            ></Image>

                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium leading-none text-white line-clamp-1">
                                    JourneyHacks 2025
                                </span>
                                <span className="text-sm leading-none text-white/60 line-clamp-1">
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
                        ></Image>
                    </div>

                    <div className="links flex-1 flex flex-col gap-1">
                        <NavLink
                            href="#"
                            label="Home"
                            icon={<HomeIcon></HomeIcon>}
                            iconAlt="Home logo"
                            platform="desktop"
                            active={url.startsWith('/home')}
                            onClick={returnHome}
                        ></NavLink>
                        <NavLink
                            href="#"
                            label="Team"
                            icon={<UserGroupIcon></UserGroupIcon>}
                            iconAlt="Team logo"
                            platform="desktop"
                            active={false}
                            disabled={true}
                        ></NavLink>

                        <NavLink
                            href="#"
                            label="Schedule"
                            icon={<CalendarDaysIcon></CalendarDaysIcon>}
                            iconAlt="Schedule logo"
                            platform="desktop"
                            active={false}
                            disabled={true}
                        ></NavLink>

                        <NavLink
                            href="#"
                            label="Alerts"
                            icon={<BellAlertIcon></BellAlertIcon>}
                            iconAlt="Alerts logo"
                            platform="desktop"
                            active={false}
                            disabled={true}
                        ></NavLink>

                        {initialData?.userRole === 'admin' && (
                            <NavLink
                                href="/admin/reviewapplications"
                                label="Review Application (Admin)"
                                icon={<BellAlertIcon></BellAlertIcon>}
                                iconAlt="Alerts logo"
                                platform="desktop"
                                active={false}
                                disabled={false}
                            ></NavLink>
                        )}
                    </div>
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <button className="group flex flex-row justify-between items-center hover:bg-neutral-750/30 rounded-lg px-3 py-2.5 gap-5 transition-colors">
                            <div className="flex flex-row gap-4 items-center">
                                <img
                                    alt="Default avatar for the user"
                                    src={
                                        initialData?.image ??
                                        '/sidebar/default-avatar.webpp'
                                    }
                                    width={32}
                                    height={32}
                                    className="rounded-full w-9 h-9"
                                ></img>

                                <div className="flex flex-col gap-2">
                                    <span className="text-white font-medium text-base leading-tight text-left line-clamp-1">
                                        {initialData?.firstName}{' '}
                                        {initialData?.lastName}
                                    </span>

                                    <span className="text-white/60 text-sm leading-none text-left line-clamp-1">
                                        {initialData?.userRole === 'user'
                                            ? 'Hacker'
                                            : 'admin'}
                                    </span>
                                </div>
                            </div>
                            <ChevronRightIcon
                                width={28}
                                height={28}
                                className="text-white/60 group-hover:text-white"
                            />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent sideOffset={8} side="right">
                        {/* TODO RAY ADD THE SIGN OUT FUNCTION HERE */}
                        <NavLink
                            href="#"
                            label="Sign out"
                            icon={<ArrowLeftEndOnRectangleIcon />}
                            iconAlt="Sign out logo"
                            platform="desktop"
                            variant="error"
                            className="px-2"
                            onClick={async () => {
                                await signOut({
                                    redirectTo: '/login',
                                });
                            }}
                        ></NavLink>
                        <PopoverPrimitive.Arrow className="fill-neutral-850 shadow-lg" />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
