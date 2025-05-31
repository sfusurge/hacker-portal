'use client';

import clsx from 'clsx';
import Image from 'next/image';
import {
    InboxStackIcon,
    CalendarDaysIcon,
    UserIcon,
    ArrowLeftEndOnRectangleIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';

import { HomeIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/outline';
import { IdentificationIcon, QrCodeIcon } from '@heroicons/react/24/solid';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { trpc } from '@/trpc/client';

import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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
    {
        href: '/team',
        label: 'Team',
        icon: <UserGroupIcon className="h-6 w-6" />,
        iconAlt: 'Teams logo',
    },
    {
        href: '/schedule',
        label: 'Schedule',
        icon: <CalendarDaysIcon className="h-6 w-6" />,
        iconAlt: 'Schedule logo',
    },
    {
        href: '/projects',
        label: 'Projects',
        icon: <InboxStackIcon className="h-6 w-6" />,
        iconAlt: 'Projects logo',
    },
    {
        href: '/notifications',
        label: 'Notifications',
        icon: <BellAlertIcon className="h-6 w-6" />,
        iconAlt: 'Notifications logo',
        disabled: true,
    },
];

const adminLinks = [
    // {
    //     href: '/projects',
    //     label: 'Projects',
    //     icon: <InboxStackIcon className="h-6 w-6" />,
    //     iconAlt: 'Projects logo',
    // },
    {
        href: '/admin/review',
        label: 'Review Applications',
        icon: <BellAlertIcon className="h-6 w-6" />,
        iconAlt: 'Review Applications logo',
    },
    {
        href: '/admin/email',
        label: 'Email Templates (Admin)',
        icon: <EnvelopeIcon className="h-6 w-6" />,
        iconAlt: 'email',
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
const judgeNavLinks = [
    // {
    //     href: '/projects',
    //     label: 'Projects',
    //     icon: <InboxStackIcon className="h-6 w-6" />,
    //     iconAlt: 'Projects logo',
    // },
    {
        href: '/schedule',
        label: 'Schedule',
        icon: <CalendarDaysIcon className="h-6 w-6" />,
        iconAlt: 'Schedule logo',
    },
];

export default function DesktopNav({
    className,
    initialData,
}: DesktopNavProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(
        '/sidebar/default-avatar.webp'
    );

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem('sidebar_collapsed');
            if (savedState) {
                setCollapsed(JSON.parse(savedState));
            }
        }
    }, []);

    const image = trpc.files.getUserImages.useQuery(
        {},
        {
            refetchOnWindowFocus: false,
        }
    );

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
                    setCollapsed(true);
                }
            }
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        if (image.data && image.data.length > 0) {
            const dataUrl = `data:image/png;base64,${image.data}`;
            setAvatarUrl(dataUrl);
        } else {
            setAvatarUrl('/sidebar/default-avatar.webp');
        }
    }, [image.data]);

    const url = usePathname();

    return (
        <div className={clsx('flex h-full flex-col pr-5', className)}>
            <div
                className={clsx(
                    'relative h-full bg-neutral-950 transition-all duration-300 ease-in-out',
                    collapsed ? 'w-12' : 'w-[280px]'
                )}
            >
                <div className="flex h-full flex-col items-center justify-between">
                    <div className={clsx('flex w-full flex-col gap-5')}>
                        <motion.div
                            className="relative overflow-hidden"
                            initial={false}
                            animate={{
                                height: collapsed ? '48px' : 'auto',
                                paddingBottom: collapsed ? '0px' : '60.25%',
                            }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                        >
                            <motion.div
                                layout
                                transition={{
                                    duration: 0.5,
                                    ease: 'easeInOut',
                                }}
                                className={clsx(
                                    'absolute z-10 flex shrink-0 items-center justify-center',
                                    'h-6 w-6',
                                    collapsed
                                        ? 'top-0 left-0 h-12 w-12'
                                        : 'top-3 left-3'
                                )}
                            >
                                <Image
                                    src="/dashboard/OtterHead.png"
                                    alt="Sparky wearing a chef's hat"
                                    width={48}
                                    height={48}
                                    className="pointer-events-none h-full w-full rounded-lg object-cover"
                                />
                            </motion.div>

                            <div className="absolute inset-0 w-full">
                                <AnimatePresence mode="wait">
                                    {!collapsed && (
                                        <motion.div
                                            key="expanded"
                                            initial={{
                                                opacity: 0,
                                                scale: 0.95,
                                            }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{
                                                duration: 0.5,
                                                ease: 'easeInOut',
                                            }}
                                            className="h-full w-full rounded-xl"
                                        >
                                            <div className="relative h-full w-full overflow-hidden rounded-xl border border-neutral-800">
                                                <div className="absolute top-0 flex w-full flex-row items-center gap-3 bg-neutral-900/50 p-3 backdrop-blur-lg">
                                                    <div className="h-6 w-6 shrink-0 opacity-0" />
                                                    <div className="mt-1 flex flex-col gap-2 overflow-hidden">
                                                        <span className="line-clamp-1 text-sm font-medium whitespace-nowrap text-white">
                                                            SparkJam 2025
                                                        </span>
                                                    </div>
                                                </div>
                                                <Image
                                                    src="/dashboard/SparkJamOtterTableHeader.png"
                                                    alt="Sparkjam"
                                                    width={200}
                                                    height={150}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

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
                                            disabled={link.disabled}
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
                                            />
                                        ))}
                                </>
                            )}
                            <Popover>
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
                                                    src={
                                                        avatarUrl ??
                                                        initialData?.image ??
                                                        '/sidebar/default-avatar.webp'
                                                    }
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
                                        disabled
                                        icon={
                                            <UserIcon className="h-6 w-6 text-white/60" />
                                        }
                                        iconAlt="Profile"
                                        platform="desktop"
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
