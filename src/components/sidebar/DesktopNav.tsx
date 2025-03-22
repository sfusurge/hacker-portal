'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { NavLink } from './NavLink';
import { HomeIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/outline';
import { QrCodeIcon } from '@heroicons/react/24/solid';
import {
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';

import { signOut } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import React from 'react';
import { MergedUserData } from '@/app/(auth)/layout';
import { SwitchTransition, CSSTransition } from 'react-transition-group';

interface DesktopNavProps {
    className?: string;
    initialData?: MergedUserData;
}

export default function DesktopNav({
    className,
    initialData,
}: DesktopNavProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(true);

    useEffect(() => {
        const checkScreenSize = () => {
            const isLarge = window.innerWidth >= 1024;
            setIsLargeScreen(isLarge);
            if (!isLarge) {
                setCollapsed(true);
            }
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const returnHome = () => {
        redirect('/home');
    };
    const url = usePathname();

    const nodeRef = React.useRef<HTMLDivElement>(null);

    // Add styles object for transitions
    const transitionStyles = {
        enter: 'opacity-0 scale-95 origin-left',
        enterActive:
            'opacity-100 scale-100 origin-left transition-all duration-[200ms] ease-in-out',
        exit: 'opacity-100 scale-100 origin-left',
        exitActive:
            'opacity-0 scale-95 origin-left transition-all duration-[200ms] ease-in-out',
    };

    return (
        <div className={clsx('flex h-full flex-col', className)}>
            {/* side part */}
            <div
                className={clsx(
                    'relative h-full bg-neutral-950 p-5 transition-all duration-200',
                    collapsed ? 'w-[80px]' : 'w-[300px]'
                )}
            >
                <div className="flex h-full flex-col justify-between">
                    <div className="flex flex-col gap-5">
                        <div
                            className={clsx(
                                'relative transition-all duration-200',
                                collapsed ? 'h-[48px]' : 'h-[180px]'
                            )}
                        >
                            <div
                                className={clsx(
                                    'absolute z-10 flex h-9 w-9 shrink-0 items-center justify-center',
                                    collapsed
                                        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                                        : 'top-3 left-3'
                                )}
                            >
                                <Image
                                    src="/login/sparkcheffrizz.webp"
                                    alt="Sparky wearing a chef's hat"
                                    width={36}
                                    height={36}
                                    className="pointer-events-none h-full w-full rounded-lg object-cover"
                                    onClick={returnHome}
                                />
                            </div>

                            <div className="absolute inset-0">
                                <SwitchTransition mode="out-in">
                                    <CSSTransition
                                        key={
                                            collapsed ? 'collapsed' : 'expanded'
                                        }
                                        timeout={100}
                                        classNames={{
                                            enter: transitionStyles.enter,
                                            enterActive:
                                                transitionStyles.enterActive,
                                            exit: transitionStyles.exit,
                                            exitActive:
                                                transitionStyles.exitActive,
                                        }}
                                        nodeRef={nodeRef}
                                    >
                                        <div
                                            ref={nodeRef}
                                            className="conditional-wrapper"
                                        >
                                            {!collapsed && (
                                                <div className="relative aspect-5/3 overflow-hidden rounded-2xl border border-neutral-800">
                                                    <div className="absolute top-0 flex w-full flex-row items-center gap-3 bg-neutral-900/50 p-3 backdrop-blur-lg">
                                                        <div className="h-9 w-9 shrink-0 opacity-0" />
                                                        <div className="mt-1 flex flex-col gap-2 overflow-hidden">
                                                            <span className="line-clamp-1 text-sm leading-none font-medium whitespace-nowrap text-white">
                                                                JourneyHacks
                                                                2025
                                                            </span>
                                                            <span className="line-clamp-1 text-sm leading-none whitespace-nowrap text-white/60">
                                                                February 14,
                                                                2025
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Image
                                                        src="/dashboard/sidebar-header.webp"
                                                        alt="Stormy and Sparky cooking"
                                                        width={200}
                                                        height={200}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </CSSTransition>
                                </SwitchTransition>
                            </div>
                        </div>

                        <div className="links flex flex-1 flex-col gap-1">
                            <NavLink
                                href="/home"
                                label="Home"
                                icon={<HomeIcon className="h-6 w-6" />}
                                iconAlt="Home logo"
                                platform="desktop"
                                active={url.startsWith('/home')}
                                className={clsx({
                                    'justify-center': collapsed,
                                })}
                            />
                            <NavLink
                                href="/team"
                                label="Team"
                                icon={<UserGroupIcon className="h-6 w-6" />}
                                iconAlt="Teams logo"
                                platform="desktop"
                                active={url.startsWith('/team')}
                                className={clsx({
                                    'justify-center': collapsed,
                                })}
                            />
                            <NavLink
                                href="/schedule"
                                label="Schedule"
                                icon={<CalendarDaysIcon className="h-6 w-6" />}
                                iconAlt="Schedule logo"
                                platform="desktop"
                                active={url.startsWith('/schedule')}
                                className={clsx({
                                    'justify-center': collapsed,
                                })}
                            />
                            <NavLink
                                href="/notifications"
                                label="Notifications"
                                icon={<BellAlertIcon className="h-6 w-6" />}
                                iconAlt="Notifications logo"
                                platform="desktop"
                                active={url.startsWith('/notifications')}
                                disabled={true}
                                className={clsx({
                                    'justify-center': collapsed,
                                })}
                            />
                            {initialData?.userRole === 'admin' && (
                                <NavLink
                                    href="/admin/reviewapplications"
                                    label="Review Applications"
                                    icon={<BellAlertIcon className="h-6 w-6" />}
                                    iconAlt="Review Applications logo"
                                    platform="desktop"
                                    active={url.startsWith(
                                        '/admin/reviewapplications'
                                    )}
                                    className={clsx({
                                        'justify-center': collapsed,
                                    })}
                                />
                            )}
                            {initialData?.userRole === 'admin' && (
                                <NavLink
                                    href="/admin/qr/hackathon/"
                                    label="Hacker Checkin (Admin)"
                                    icon={
                                        <QrCodeIcon className="h-6 w-6"></QrCodeIcon>
                                    }
                                    iconAlt="QR logo"
                                    platform="desktop"
                                    active={url.startsWith('/admin/qr')}
                                    className={clsx({
                                        'justify-center': collapsed,
                                    })}
                                ></NavLink>
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
                                'flex h-11 w-full items-center gap-3 rounded-lg px-3 text-red-400 transition-colors hover:bg-red-950/30 hover:text-red-300',
                                collapsed ? 'justify-center' : 'justify-start'
                            )}
                            aria-label="Sign out"
                        >
                            <div className="flex h-6 w-6 items-center justify-center">
                                <ArrowLeftEndOnRectangleIcon className="h-6 w-6" />
                            </div>
                            {!collapsed && (
                                <span className="text-sm font-medium">
                                    Sign Out
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            {/* top part */}
            <div
                className={clsx(
                    'fixed top-0 z-50 flex h-16 items-center justify-between border-b border-neutral-950 bg-neutral-950 px-5 transition-all duration-200',
                    collapsed ? 'left-[80px]' : 'left-[300px]',
                    'right-0'
                )}
            >
                <div className="flex items-center gap-3">
                    {isLargeScreen && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="flex rounded-lg bg-neutral-950 p-1.5 transition-colors hover:bg-neutral-900"
                            aria-label={
                                collapsed
                                    ? 'Expand sidebar'
                                    : 'Collapse sidebar'
                            }
                        >
                            {collapsed ? (
                                <ChevronDoubleRightIcon className="h-5 w-5 text-white/60 hover:text-white" />
                            ) : (
                                <ChevronDoubleLeftIcon className="h-5 w-5 text-white/60 hover:text-white" />
                            )}
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0">
                        <img
                            alt="Default avatar for the user"
                            src={
                                initialData?.image ??
                                '/sidebar/default-avatar.webpp'
                            }
                            width={32}
                            height={32}
                            className="h-full w-full rounded-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
