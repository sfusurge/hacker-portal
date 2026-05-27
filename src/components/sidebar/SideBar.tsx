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
import { QrCodeIcon } from '@heroicons/react/24/solid';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { motion } from 'motion/react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import { navLinkVariants, NavLink } from './NavLink';
import { EVENT_PAGE_NAV_LINKS } from '@/components/home/eventPageConfig';
import { UserData } from '@/server/routers/usersRouter';
import { DEFAULT_USER_AVATAR, resolveUserIconUrl } from '@/utils/blobHelper';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { useAtomValue } from 'jotai';
import { canAccessProjectGallery } from '@/lib/submissionWindow';
import {
    isSparkjamProjectsArea,
    SPARKJAM_PROJECTS_PATH,
} from '@/lib/projects/projectsPaths';

/** mobile (under 768px) user can expand/collapse. */
const SIDEBAR_MOBILE_MAX_PX = 768;
/** desktop (≥1180px) user can expand/collapse; preference is saved. between mobile max and this = tablet: always collapsed, no toggle. */
const SIDEBAR_DESKTOP_MIN_PX = 1180;

function isTabletWidth(w: number) {
    return w >= SIDEBAR_MOBILE_MAX_PX && w < SIDEBAR_DESKTOP_MIN_PX;
}

/** desktop (≥1180px) collapse preference */
const LS_SIDEBAR_DESKTOP = 'sidebar_collapsed_desktop';
/** mobile (under 768px) collapse preference*/
const LS_SIDEBAR_MOBILE = 'sidebar_collapsed_mobile';

interface NavProps {
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
        href: '/announcements',
        label: 'Announcements',
        icon: <MegaphoneIcon className="h-6 w-6" />,
        iconAlt: 'Announcement logo',
    },
];

const projectGalleryLink = {
    href: '/projects',
    label: 'Project Gallery',
    icon: <InboxStackIcon className="h-6 w-6" />,
    iconAlt: 'Project gallery logo',
};

const adminLinks = [
    {
        href: '/admin/qr',
        label: 'Hacker Checkin',
        icon: <QrCodeIcon className="h-6 w-6" />,
        iconAlt: 'QR logo',
    },
    {
        href: '/admin/review',
        label: 'Review Applications',
        icon: <UserGroupIcon className="h-6 w-6" />,
        iconAlt: 'Review Applications logo',
    },
    {
        href: '/admin/email/templates',
        label: 'Emails',
        icon: <EnvelopeIcon className="h-6 w-6" />,
        iconAlt: 'Emails logo',
    },
];

// JUDGES CAN ONLY SEE THESE LINKS
const judgeNavLinks = [
    {
        href: SPARKJAM_PROJECTS_PATH,
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

export default function SideBar({ className, initialData }: NavProps) {
    const hackathon = useAtomValue(hackathonAtom);
    const [now] = useState(() => Date.now());
    const [collapsed, setCollapsed] = useState(false);
    const [showCollapseToggle, setShowCollapseToggle] = useState(false);
    const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
    const [profilePopoverSide, setProfilePopoverSide] = useState<
        'right' | 'bottom'
    >(() =>
        typeof window !== 'undefined' &&
        window.innerWidth < SIDEBAR_MOBILE_MAX_PX
            ? 'bottom'
            : 'right'
    );

    const applyCollapsedForWidth = (w: number) => {
        if (isTabletWidth(w)) {
            setCollapsed(true);
            return;
        }
        if (w < SIDEBAR_MOBILE_MAX_PX) {
            const saved = localStorage.getItem(LS_SIDEBAR_MOBILE);
            setCollapsed(
                saved !== null ? (JSON.parse(saved) as boolean) : false
            );
            return;
        }
        const saved = localStorage.getItem(LS_SIDEBAR_DESKTOP);
        setCollapsed(saved !== null ? (JSON.parse(saved) as boolean) : false);
    };

    const galleryAccessible =
        hackathon != null &&
        canAccessProjectGallery(
            now,
            hackathon.projectGalleryOpen?.toDate() ?? null,
            hackathon.submissionDeadline.toDate(),
            initialData?.userRole
        );

    const mainNavLinks = useMemo(() => {
        if (!galleryAccessible) return navLinks;

        const announcementsIndex = navLinks.findIndex(
            (link) => link.href === '/announcements'
        );
        if (announcementsIndex === -1) {
            return [...navLinks, projectGalleryLink];
        }

        return [
            ...navLinks.slice(0, announcementsIndex + 1),
            projectGalleryLink,
            ...navLinks.slice(announcementsIndex + 1),
        ];
    }, [galleryAccessible]);

    useEffect(() => {
        const checkScreenSize = () => {
            if (typeof window === 'undefined') return;
            const w = window.innerWidth;
            setShowCollapseToggle(w >= SIDEBAR_DESKTOP_MIN_PX);
            setProfilePopoverSide(
                w < SIDEBAR_MOBILE_MAX_PX ? 'bottom' : 'right'
            );
            applyCollapsedForWidth(w);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const toggleCollapsed = () => {
        if (typeof window === 'undefined') return;
        const w = window.innerWidth;
        if (isTabletWidth(w)) return;
        setCollapsed((prev) => {
            const next = !prev;
            if (w < SIDEBAR_MOBILE_MAX_PX) {
                localStorage.setItem(LS_SIDEBAR_MOBILE, JSON.stringify(next));
            } else if (w >= SIDEBAR_DESKTOP_MIN_PX) {
                localStorage.setItem(LS_SIDEBAR_DESKTOP, JSON.stringify(next));
            }
            return next;
        });
    };

    const avatarUrl = useMemo(
        () => resolveUserIconUrl(initialData?.image),
        [initialData?.image]
    );

    const url = usePathname();
    const isPublicSparkjamRoute = isSparkjamProjectsArea(url) && !initialData;
    const showJudgeNav =
        initialData?.userRole === 'judge' || isPublicSparkjamRoute;

    return (
        <div
            className={clsx(
                'no-scrollbar flex h-full max-h-full min-h-0 w-full min-w-0 touch-pan-y flex-col overflow-x-hidden overflow-y-auto pr-5',
                className
            )}
        >
            <div
                className={clsx(
                    'relative h-full bg-neutral-950 pt-5 transition-all duration-300 ease-in-out sm:pt-10',
                    collapsed ? 'w-12' : 'w-[280px]'
                )}
            >
                <div className="flex h-full flex-col items-center justify-between">
                    <div className={clsx('flex w-full flex-col gap-5')}>
                        <div
                            className={clsx(
                                'links flex w-full flex-1 flex-col items-stretch gap-1 px-4 md:px-0'
                            )}
                        >
                            {showJudgeNav ? (
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
                                    {mainNavLinks.map((link) => (
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
                                </>
                            )}
                            {isPublicSparkjamRoute && (
                                <NavLink
                                    href="/login"
                                    label="Login"
                                    icon={
                                        <ArrowLeftEndOnRectangleIcon className="h-6 w-6" />
                                    }
                                    iconAlt="Login"
                                    platform="desktop"
                                    active={false}
                                    collapsed={collapsed}
                                />
                            )}

                            {!showJudgeNav &&
                                initialData?.userRole !== 'sponsor' && (
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
                                                {collapsed ? (
                                                    <PopoverPrimitive.Anchor
                                                        asChild
                                                    >
                                                        <div
                                                            className={cn(
                                                                'flex h-6 w-6 items-center justify-center transition-colors',
                                                                url.startsWith(
                                                                    '/profile'
                                                                )
                                                                    ? 'text-brand-400 group-hover:text-brand-200'
                                                                    : 'group-text-white/70 text-white/30'
                                                            )}
                                                        >
                                                            <div className="h-6 w-6 overflow-hidden rounded-full">
                                                                <img
                                                                    alt="User avatar"
                                                                    src={
                                                                        avatarUrl
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                    onError={(
                                                                        e
                                                                    ) => {
                                                                        e.currentTarget.src =
                                                                            DEFAULT_USER_AVATAR;
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </PopoverPrimitive.Anchor>
                                                ) : (
                                                    <>
                                                        <div
                                                            className={cn(
                                                                'flex h-6 w-6 items-center justify-center transition-colors',
                                                                url.startsWith(
                                                                    '/profile'
                                                                )
                                                                    ? 'text-brand-400 group-hover:text-brand-200'
                                                                    : 'group-text-white/70 text-white/30'
                                                            )}
                                                        >
                                                            <div className="h-6 w-6 overflow-hidden rounded-full">
                                                                <img
                                                                    alt="User avatar"
                                                                    src={
                                                                        avatarUrl
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                    onError={(
                                                                        e
                                                                    ) => {
                                                                        e.currentTarget.src =
                                                                            DEFAULT_USER_AVATAR;
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <motion.div
                                                            className="flex w-full items-center justify-between"
                                                            initial={{
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.2,
                                                            }}
                                                        >
                                                            <span className="leading-none whitespace-nowrap">
                                                                Profile
                                                            </span>
                                                            <PopoverPrimitive.Anchor
                                                                asChild
                                                            >
                                                                <span className="inline-flex size-6 shrink-0 items-center justify-center">
                                                                    <ChevronRightIcon className="h-4 w-4" />
                                                                </span>
                                                            </PopoverPrimitive.Anchor>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            key={profilePopoverSide}
                                            side={profilePopoverSide}
                                            align="center"
                                            sideOffset={
                                                profilePopoverSide === 'bottom'
                                                    ? 16
                                                    : 24
                                            }
                                            collisionPadding={
                                                profilePopoverSide === 'bottom'
                                                    ? 16
                                                    : undefined
                                            }
                                            className={cn(
                                                'z-200 w-48 border border-neutral-600/30',
                                                profilePopoverSide ===
                                                    'bottom' &&
                                                    '!mr-0 max-w-[min(12rem,calc(100vw-2rem))]'
                                            )}
                                        >
                                            <NavLink
                                                href="/profile"
                                                label="Edit profile"
                                                icon={
                                                    <UserIcon className="h-6 w-6 text-white/60" />
                                                }
                                                iconAlt="Profile"
                                                platform="desktop"
                                                active={url.startsWith(
                                                    '/profile'
                                                )}
                                                onClick={() =>
                                                    setProfilePopoverOpen(false)
                                                }
                                            />
                                            <NavLink
                                                href="#"
                                                label="Sign out"
                                                icon={
                                                    <ArrowLeftEndOnRectangleIcon className="text-danger-400 h-6 w-6" />
                                                }
                                                iconAlt="Sign out logo"
                                                platform="desktop"
                                                variant="error"
                                                onClick={async () => {
                                                    setProfilePopoverOpen(
                                                        false
                                                    );
                                                    await signOut();
                                                    if (
                                                        typeof window !==
                                                        'undefined'
                                                    ) {
                                                        localStorage.removeItem(
                                                            'auth-login-success'
                                                        );
                                                    }
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}

                            {initialData?.userRole === 'admin' && (
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
                                            Admin
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
                                        {adminLinks.map((link) => (
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

                            {(initialData?.userRole === 'user' ||
                                initialData?.userRole === 'admin') && (
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
                                        {EVENT_PAGE_NAV_LINKS.map((link) => (
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
                        {showCollapseToggle && (
                            <motion.button
                                onClick={toggleCollapsed}
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
