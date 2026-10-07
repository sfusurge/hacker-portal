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
    TrophyIcon,
    HomeModernIcon,
    GiftIcon,
} from '@heroicons/react/24/outline';

import { HomeIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { signOutAndRedirect } from '@/auth/auth-client';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { motion } from 'motion/react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import { navLinkVariants, NavLink } from './NavLink';
import {
    buildEventPageNavLinksFromHackathons,
    resolveProjectsHref,
} from '@/components/home/eventPageConfig';
import { trpc } from '@/trpc/client';
import { UserData } from '@/server/routers/usersRouter';
import { DEFAULT_USER_AVATAR, resolveUserIconUrl } from '@/utils/blobHelper';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { useAtomValue } from 'jotai';
import { canAccessProjectGallery } from '@/lib/submissionWindow';
import { hasAdminAccess, isOwner } from '@/lib/auth/roles';
import {
    isSparkjamProjectsArea,
    SPARKJAM_PROJECTS_PATH,
} from '@/lib/projects/projectsPaths';
import { isEligibleForHackathonTicketQr } from '@/lib/applicationAcceptStatus';

/** Hacker points / games app (NFC badges land here). */
const POINTS_URL = 'https://points.sfusurge.com';

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
    publicSponsorPortal?: boolean;
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

const pointsNavLink = {
    href: POINTS_URL,
    label: 'Points',
    icon: <SparklesIcon className="h-6 w-6" />,
    iconAlt: 'Points logo',
};

// Owner-only (hackathon configuration).
const ownerLinks = [
    {
        href: '/admin/hackathons',
        label: 'Hackathons',
        icon: <TrophyIcon className="h-6 w-6" />,
        iconAlt: 'Hackathons logo',
    },
];

const adminLinks = [
    {
        href: '/admin/review',
        label: 'Review Applications',
        icon: <UserGroupIcon className="h-6 w-6" />,
        iconAlt: 'Review Applications logo',
    },
    {
        href: '/admin/resumes',
        label: 'Resume Bank',
        icon: <InboxStackIcon className="h-6 w-6" />,
        iconAlt: 'Resume Bank',
    },
    {
        href: '/admin/statistics',
        label: 'Statistics',
        icon: <ChartBarIcon className="h-6 w-6" />,
        iconAlt: 'Statistics',
        dropdownItems: [
            {
                label: 'Single hackathon',
                href: '/admin/statistics',
                icon: <ChartBarIcon className="h-6 w-6 text-white/60" />,
                iconAlt: 'Single hackathon',
            },
            {
                label: 'Range view',
                href: '/admin/statistics/range',
                icon: <ChartBarIcon className="h-6 w-6 text-white/60" />,
                iconAlt: 'Range view',
            },
        ],
    },
    {
        href: '/admin/email/templates',
        label: 'Emails',
        icon: <EnvelopeIcon className="h-6 w-6" />,
        iconAlt: 'Emails logo',
    },
    {
        href: '/admin/checkins',
        label: 'Check-ins',
        icon: <ChartBarIcon className="h-6 w-6" />,
        iconAlt: 'Check-ins logo',
    },
    {
        href: '/admin/challenges',
        label: 'Points',
        icon: <TrophyIcon className="h-6 w-6" />,
        iconAlt: 'Points logo',
        dropdownItems: [
            {
                label: 'Challenges',
                href: '/admin/challenges',
                icon: <TrophyIcon className="h-6 w-6 text-white/60" />,
                iconAlt: 'Challenges',
            },
            {
                label: 'Houses',
                href: '/admin/houses',
                icon: <HomeModernIcon className="h-6 w-6 text-white/60" />,
                iconAlt: 'Houses',
            },
            {
                label: 'Shop',
                href: '/admin/shop',
                icon: <GiftIcon className="h-6 w-6 text-white/60" />,
                iconAlt: 'Shop',
            },
        ],
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

type SponsorNavLink = {
    href: string;
    label: string;
    icon: ReactNode;
    iconAlt: string;
    exact?: boolean;
    matchPath?: string;
    external?: boolean;
};

function buildPublicSponsorNavLinks(
    projectsHref?: string | null
): SponsorNavLink[] {
    const links: SponsorNavLink[] = [
        {
            href: '/sponsor',
            matchPath: '/sponsor',
            label: 'Home',
            icon: <HomeIcon className="h-6 w-6" />,
            iconAlt: 'Sponsor home',
            exact: true,
        },
        {
            href: '/sponsor/resumes',
            matchPath: '/sponsor/resumes',
            label: 'Resume Bank',
            icon: <UserGroupIcon className="h-6 w-6" />,
            iconAlt: 'Resume Bank',
            exact: false,
        },
        {
            href: '/sponsor/statistics',
            matchPath: '/sponsor/statistics',
            label: 'Statistics',
            icon: <ChartBarIcon className="h-6 w-6" />,
            iconAlt: 'Statistics',
            exact: false,
        },
    ];
    if (projectsHref) {
        links.push({
            href: projectsHref,
            label: 'Projects',
            icon: <InboxStackIcon className="h-6 w-6" />,
            iconAlt: 'Projects',
            exact: true,
            external: true,
        });
    }
    return links;
}

function isSponsorNavActive(
    url: string,
    link: { href: string; matchPath?: string; exact?: boolean }
) {
    const path = link.matchPath ?? link.href.split('?')[0];
    if (link.exact) return url === path;
    return url === path || url.startsWith(`${path}/`);
}

export default function SideBar({
    className,
    initialData,
    publicSponsorPortal = false,
}: NavProps) {
    const hackathon = useAtomValue(hackathonAtom);
    const isPublicSponsorPortal = publicSponsorPortal;
    const { data: visibleHackathons = [] } =
        trpc.hackathons.getVisibleHackathonsForNav.useQuery(undefined, {
            enabled: !isPublicSponsorPortal,
        });
    const eventPageNavLinks = useMemo(
        () => buildEventPageNavLinksFromHackathons(visibleHackathons),
        [visibleHackathons]
    );
    const [now, setNow] = useState(0);
    useEffect(() => {
        setNow(Date.now());
    }, []);
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
            hackathon.submissionDeadline?.toDate() ?? null,
            initialData?.userRole,
            hackathon.submissionOpen?.toDate() ?? null
        );

    const { data: currentApplication } =
        trpc.applications.getCurrentApplication.useQuery(
            { hackathonId: hackathon?.id ?? -1 },
            {
                enabled:
                    !isPublicSponsorPortal &&
                    Boolean(hackathon?.id) &&
                    Boolean(initialData) &&
                    initialData?.userRole !== 'judge',
            }
        );

    const sponsorProjectsHref = resolveProjectsHref(
        hackathon?.eventPagePayload,
        {
            eventPageSlug: hackathon?.eventPageSlug,
            hackathonName: hackathon?.name,
        }
    );

    const resolvedSponsorNavLinks = useMemo(
        () =>
            isPublicSponsorPortal
                ? buildPublicSponsorNavLinks(sponsorProjectsHref)
                : [],
        [isPublicSponsorPortal, sponsorProjectsHref]
    );

    const showPointsLink = isEligibleForHackathonTicketQr(
        currentApplication?.currentStatus
    );

    const mainNavLinks = useMemo(() => {
        let links = navLinks;

        if (showPointsLink) {
            const scheduleIndex = links.findIndex(
                (link) => link.href === '/schedule'
            );
            links =
                scheduleIndex === -1
                    ? [...links, pointsNavLink]
                    : [
                          ...links.slice(0, scheduleIndex + 1),
                          pointsNavLink,
                          ...links.slice(scheduleIndex + 1),
                      ];
        }

        if (!galleryAccessible) return links;

        const announcementsIndex = links.findIndex(
            (link) => link.href === '/announcements'
        );
        if (announcementsIndex === -1) {
            return [...links, projectGalleryLink];
        }

        return [
            ...links.slice(0, announcementsIndex + 1),
            projectGalleryLink,
            ...links.slice(announcementsIndex + 1),
        ];
    }, [galleryAccessible, showPointsLink]);

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
                            ) : isPublicSponsorPortal ? (
                                resolvedSponsorNavLinks.map((link) => (
                                    <NavLink
                                        key={link.href}
                                        href={link.href}
                                        label={link.label}
                                        icon={link.icon}
                                        iconAlt={link.iconAlt}
                                        platform="desktop"
                                        active={
                                            link.external
                                                ? false
                                                : isSponsorNavActive(url, link)
                                        }
                                        collapsed={collapsed}
                                        target={
                                            link.external ? '_blank' : undefined
                                        }
                                        rel={
                                            link.external
                                                ? 'noopener noreferrer'
                                                : undefined
                                        }
                                    />
                                ))
                            ) : (
                                <>
                                    {mainNavLinks.map((link) => {
                                        const isExternal =
                                            link.href.startsWith('http');
                                        return (
                                            <NavLink
                                                key={link.href}
                                                href={link.href}
                                                label={link.label}
                                                icon={link.icon}
                                                iconAlt={link.iconAlt}
                                                platform="desktop"
                                                active={
                                                    isExternal
                                                        ? false
                                                        : url.startsWith(
                                                              link.href
                                                          )
                                                }
                                                collapsed={collapsed}
                                                target={
                                                    isExternal
                                                        ? '_blank'
                                                        : undefined
                                                }
                                                rel={
                                                    isExternal
                                                        ? 'noopener noreferrer'
                                                        : undefined
                                                }
                                            />
                                        );
                                    })}
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

                            {!isPublicSparkjamRoute &&
                                !isPublicSponsorPortal &&
                                initialData && (
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
                                                'z-[2000] w-48 border border-neutral-600/30',
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
                                                href="/signout"
                                                label="Sign out"
                                                icon={
                                                    <ArrowLeftEndOnRectangleIcon className="text-danger-400 h-6 w-6" />
                                                }
                                                iconAlt="Sign out logo"
                                                platform="desktop"
                                                variant="error"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setProfilePopoverOpen(
                                                        false
                                                    );
                                                    void signOutAndRedirect(
                                                        '/login'
                                                    );
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}

                            {hasAdminAccess(initialData?.userRole) && (
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
                                        {isOwner(initialData?.userRole) &&
                                            ownerLinks.map((link) => (
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
                                        {adminLinks.map((link) => {
                                            const dropdownHrefs =
                                                link.dropdownItems?.map(
                                                    (item) => item.href
                                                ) ?? [];
                                            const isActive =
                                                url.startsWith(link.href) ||
                                                dropdownHrefs.some((href) =>
                                                    url.startsWith(href)
                                                );

                                            return (
                                                <NavLink
                                                    key={link.label}
                                                    href={link.href}
                                                    label={link.label}
                                                    icon={link.icon}
                                                    iconAlt={link.iconAlt}
                                                    platform="desktop"
                                                    active={isActive}
                                                    collapsed={collapsed}
                                                    dropdownItems={
                                                        link.dropdownItems
                                                    }
                                                />
                                            );
                                        })}
                                    </motion.div>
                                </>
                            )}

                            {(initialData?.userRole === 'user' ||
                                hasAdminAccess(initialData?.userRole)) &&
                                eventPageNavLinks.length > 0 && (
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
                                            {eventPageNavLinks.map(
                                                (link, index) => (
                                                    <NavLink
                                                        key={`${link.href}-${index}`}
                                                        href={link.href}
                                                        label={link.label}
                                                        icon={link.icon}
                                                        iconAlt={link.iconAlt}
                                                        platform="desktop"
                                                        active={
                                                            url === link.href ||
                                                            url.startsWith(
                                                                `${link.href}/`
                                                            )
                                                        }
                                                        collapsed={collapsed}
                                                    />
                                                )
                                            )}
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
