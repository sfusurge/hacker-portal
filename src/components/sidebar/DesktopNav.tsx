'use client';

import clsx from 'clsx';
import {
    InboxStackIcon,
    CalendarDaysIcon,
    UserIcon,
    ArrowLeftEndOnRectangleIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    ChevronRightIcon,
    ChartBarIcon,
    MegaphoneIcon,
} from '@heroicons/react/24/outline';

import { HomeIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/outline';
import { IdentificationIcon, QrCodeIcon } from '@heroicons/react/24/solid';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import { navLinkVariants, NavLink } from './NavLink';
import { UserData } from '@/server/routers/usersRouter';
import { getIcon } from '@/utils/blobHelper';

interface DesktopNavProps {
    className?: string;
    initialData?: UserData;
}

const navLinks = [
    {
        href: '/home',
        label: 'Home',
        icon: <HomeIcon className="h-6 w-6" />,
        iconAlt: 'Home logo',
    },
    // {
    //     href: '/team',
    //     label: 'Team',
    //     icon: <UserGroupIcon className="h-6 w-6" />,
    //     iconAlt: 'Teams logo',
    // },
    {
        href: '/schedule',
        label: 'Schedule',
        icon: <CalendarDaysIcon className="h-6 w-6" />,
        iconAlt: 'Schedule logo',
    },
    {
        href: '/src/auth/annoucments/page.tsx',
        label: 'Announcement',
        icon: <MegaphoneIcon className="h-6 w-6" />,
        iconAlt: 'Announcement logo',
    },
    // {
    //     href: '/notifications',
    //     label: 'Notifications',
    //     icon: <BellAlertIcon className="h-6 w-6" />,
    //     iconAlt: 'Notifications logo',
    //     disabled: true,
    // },
    // {
    //     href: '/projects',
    //     label: 'Project Gallery',
    //     icon: <InboxStackIcon className="h-6 w-6" />,
    //     iconAlt: 'Project gallery logo',
    // },
];

const adminLinks = [
    {
        href: '/admin/review',
        label: 'Review Applications',
        icon: <BellAlertIcon className="h-6 w-6" />,
        iconAlt: 'Review Applications logo',
    },
    {
        href: '/admin/email',
        label: 'Emails',
        icon: <EnvelopeIcon className="h-6 w-6" />,
        iconAlt: 'Emails logo',
        dropdownItems: [
            { label: 'Email Templates', href: '/admin/email/templates' },
            { label: 'Subscribed Emails', href: '/admin/email/subscribed' },
        ],
    },
    {
        href: '/admin/judge',
        label: 'Judge Assignment',
        icon: <IdentificationIcon className="h-6 w-6" />,
        iconAlt: 'judge',
    },
    {
        href: '/admin/qr',
        label: 'Hacker Checkin (Admin)',
        icon: <QrCodeIcon className="h-6 w-6" />,
        iconAlt: 'QR logo',
    },
];

// JUDGES CAN ONLY SEE THESE LINKS
const judgeNavLinks = [
    {
        href: '/projects',
        label: 'Projects',
        icon: <InboxStackIcon className="h-6 w-6" />,
        iconAlt: 'Projects logo',
    },
    {
        href: '/schedule',
        label: 'Schedule',
        icon: <CalendarDaysIcon className="h-6 w-6" />,
        iconAlt: 'Schedule logo',
    },
];

// SPONSORS CAN ONLY SEE THESE LINKS
const sponsorNavLinks = [
    {
        href: '/home',
        label: 'Home',
        icon: <HomeIcon className="h-6 w-6" />,
        iconAlt: 'Home logo',
    },
    {
        href: '/review',
        label: 'Resume Bank',
        icon: <UserGroupIcon className="h-6 w-6" />,
        iconAlt: 'Resume Bank logo',
    },
    {
        href: '/statistics',
        label: 'Statistics',
        icon: <ChartBarIcon className="h-6 w-6" />,
        iconAlt: 'Stats logo',
    },
    {
        href: '/schedule',
        label: 'Schedule',
        icon: <CalendarDaysIcon className="h-6 w-6" />,
        iconAlt: 'Schedule logo',
    },
];

// USER ONLY EVENT LINKS
const eventLinks = [
    {
        href: '/stormhacks', // TODO: Fill it up with Steph's work
        label: 'Stormhacks',
        icon: '/dashboard/sh25head.png',
        iconAlt: 'Stormhacks logo',
    },
    {
        href: '/journeyhacks', // TODO: Fill it up with Steph's work
        label: 'Journeyhacks',
        icon: '/dashboard/jh26head.png',
        iconAlt: 'Journeyhacks logo',
    },
    {
        href: '/stormforge', // TODO: Fill it up with Steph's work
        label: 'StormForge',
        icon: '/dashboard/sf26head.png',
        iconAlt: 'StormForge logo',
    },
    {
        href: '/sillyhacks', // TODO: Fill it up with Steph's work
        label: 'Sillyhacks',
        icon: '/dashboard/sillyhackshead.png',
        iconAlt: 'Sillyhacks logo',
    },
    {
        href: '/sparkjam', // TODO: Fill it up with Steph's work
        label: 'Sparkjam',
        icon: '/dashboard/OtterHead.png',
        iconAlt: 'Sparkjam logo',
    },
];

export default function DesktopNav({
    className,
    initialData,
}: DesktopNavProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(true);
    const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem('sidebar_collapsed');
            if (savedState) {
                setCollapsed(JSON.parse(savedState));
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(
                'sidebar_collapsed',
                JSON.stringify(collapsed)
            );
        }
    }, [collapsed]);

    useEffect(() => {
        const checkScreenSize = () => {
            if (typeof window !== 'undefined') {
                const isLarge = window.innerWidth >= 1080;
                setIsLargeScreen(isLarge);
                if (!isLarge) {
                    setCollapsed(false);
                }
            }
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const avatarUrl = useMemo(() => {
        if (initialData && initialData.image) {
            return getIcon('user_icon', initialData.image);
        }
        return '/sidebar/default-avatar.webp';
    }, [initialData]);

    const url = usePathname();

    return (
        <div
            className={clsx(
                'no-scrollbar flex max-h-screen flex-col overflow-y-auto pr-5',
                className
            )}
        >
            <div
                className={clsx(
                    'relative h-full bg-neutral-950 transition-all duration-300 ease-in-out',
                    collapsed ? 'w-12' : 'w-[280px]'
                )}
            >
                <div className="flex h-full flex-col items-center justify-between">
                    <div className={clsx('flex w-full flex-col gap-5')}>
                        <div
                            className={clsx(
                                'links flex w-full flex-1 flex-col items-stretch gap-1'
                            )}
                        >
                            {initialData?.userRole === 'judge' ? (
                                judgeNavLinks.map((link) => (
                                    <NavLink
                                        key={link.href}
                                        href={link.href}
                                        label={link.label}
                                        icon={link.icon}
                                        iconAlt={link.iconAlt}
                                        platform="desktop"
                                        active={url.startsWith(link.href)}
                                        collapsed={collapsed}
                                    />
                                ))
                            ) : initialData?.userRole === 'sponsor' ? (
                                sponsorNavLinks.map((link) => (
                                    <NavLink
                                        key={link.href}
                                        href={link.href}
                                        label={link.label}
                                        icon={link.icon}
                                        iconAlt={link.iconAlt}
                                        platform="desktop"
                                        active={url.startsWith(link.href)}
                                        collapsed={collapsed}
                                    />
                                ))
                            ) : (
                                <>
                                    {navLinks.map((link) => (
                                        <NavLink
                                            key={link.href}
                                            href={link.href}
                                            label={link.label}
                                            icon={link.icon}
                                            iconAlt={link.iconAlt}
                                            platform="desktop"
                                            active={url.startsWith(link.href)}
                                            collapsed={collapsed}
                                        />
                                    ))}

                                    {initialData?.userRole === 'admin' &&
                                        adminLinks.map((link) => (
                                            <NavLink
                                                key={link.href}
                                                href={link.href}
                                                label={link.label}
                                                icon={link.icon}
                                                iconAlt={link.iconAlt}
                                                platform="desktop"
                                                active={url.startsWith(
                                                    link.href
                                                )}
                                                collapsed={collapsed}
                                                dropdownItems={
                                                    link.dropdownItems
                                                }
                                            />
                                        ))}
                                </>
                            )}
                            <Popover
                                open={profilePopoverOpen}
                                onOpenChange={setProfilePopoverOpen}
                            >
                                <PopoverTrigger asChild>
                                    <div
                                        className={cn(
                                            navLinkVariants({
                                                platform: 'desktop',
                                                active: url.startsWith(
                                                    '/profile'
                                                ),
                                                disabled: false,
                                            }),
                                            collapsed
                                                ? 'justify-start'
                                                : 'w-full justify-start',
                                            'cursor-pointer'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'flex h-6 w-6 items-center justify-center transition-colors',
                                                url.startsWith('/profile')
                                                    ? 'text-brand-400 group-hover:text-brand-200'
                                                    : 'text-white/30 group-hover:text-white/60'
                                            )}
                                        >
                                            <div className="h-6 w-6 overflow-hidden rounded-full">
                                                <img
                                                    alt="User avatar"
                                                    src={avatarUrl}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        {!collapsed && (
                                            <motion.div
                                                className="flex w-full items-center justify-between"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <span className="leading-none whitespace-nowrap">
                                                    Profile
                                                </span>
                                                <ChevronRightIcon className="ml-2 h-4 w-4" />
                                            </motion.div>
                                        )}
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent
                                    sideOffset={8}
                                    side="right"
                                    className="z-200 w-48"
                                >
                                    <NavLink
                                        href="/profile"
                                        label="Edit profile"
                                        icon={
                                            <UserIcon className="h-6 w-6 text-white/60" />
                                        }
                                        iconAlt="Profile"
                                        platform="desktop"
                                        active={url.startsWith('/profile')}
                                        onClick={() =>
                                            setProfilePopoverOpen(false)
                                        }
                                    />
                                    <NavLink
                                        href="#"
                                        label="Sign out"
                                        icon={
                                            <ArrowLeftEndOnRectangleIcon className="h-6 w-6 text-white/60" />
                                        }
                                        iconAlt="Sign out logo"
                                        platform="desktop"
                                        variant="error"
                                        onClick={async () => {
                                            setProfilePopoverOpen(false);
                                            await signOut();
                                            if (typeof window !== 'undefined') {
                                                localStorage.removeItem(
                                                    'auth-login-success'
                                                );
                                            }
                                        }}
                                    />
                                    <PopoverPrimitive.Arrow className="fill-neutral-850 mr-4 shadow-lg" />
                                </PopoverContent>
                            </Popover>

                            {initialData?.userRole === 'user' && (
                                <>
                                    <div className="my-4 border-t border-white/10" />

                                    {!collapsed ? (
                                        <motion.span
                                            className="mb-2 px-3 text-sm leading-[125%] font-semibold tracking-[-0.0075em] text-white/30"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 0.5,
                                                ease: 'easeInOut',
                                            }}
                                        >
                                            Our Events
                                        </motion.span>
                                    ) : null}

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            ease: 'easeInOut',
                                        }}
                                        className="flex flex-col gap-1"
                                    >
                                        {eventLinks.map((link) => (
                                            <NavLink
                                                key={link.href}
                                                href={link.href}
                                                label={link.label}
                                                icon={link.icon}
                                                iconAlt={link.iconAlt}
                                                platform="desktop"
                                                active={url.startsWith(
                                                    link.href
                                                )}
                                                collapsed={collapsed}
                                            />
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto w-full pt-5">
                        {isLargeScreen && (
                            <motion.button
                                onClick={() => setCollapsed(!collapsed)}
                                className="hover:bg-neutral-750/30 flex w-full items-center justify-start gap-2 rounded-lg px-3 py-2 text-white transition-colors"
                                initial={false}
                                animate={{
                                    width: collapsed ? '48px' : '100%',
                                }}
                                transition={{
                                    duration: 0.3,
                                    ease: 'easeInOut',
                                }}
                            >
                                {collapsed ? (
                                    <ChevronDoubleRightIcon className="h-4 w-4" />
                                ) : (
                                    <motion.div
                                        className="flex w-full items-center gap-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                            delay: 0.1,
                                            duration: 0.2,
                                        }}
                                    >
                                        <ChevronDoubleLeftIcon className="h-4 w-4" />
                                        <span className="whitespace-nowrap">
                                            Collapse Sidebar
                                        </span>
                                    </motion.div>
                                )}
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
