'use client';

import clsx from 'clsx';
import { NavLink } from './NavLink';
import { HomeIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/outline';
import { InboxStackIcon, ChartBarIcon } from '@heroicons/react/24/outline';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QrCodeIcon } from '@heroicons/react/24/solid';
import SelectOption from '@/app/(auth)/admin/qr/checkin_components/SelectOption';
import { UserData } from '@/server/routers/usersRouter';
import {
    isSparkjamProjectsArea,
    SPARKJAM_PROJECTS_PATH,
} from '@/lib/projects/projectsPaths';
import { hasAdminAccess } from '@/lib/auth/roles';

interface MobileBottomNavProps {
    className?: string;
    initialData?: UserData;
}

const excludedUrls = ['/application', '/admin/qr'];

const judgeNavLinks = [
    {
        href: SPARKJAM_PROJECTS_PATH,
        label: 'Projects',
        icon: <InboxStackIcon />,
        iconAlt: 'Projects logo',
    },
    {
        href: '/schedule',
        label: 'Schedule',
        icon: <CalendarDaysIcon />,
        iconAlt: 'Schedule logo',
    },
];

const sponsorNavLinks = [
    {
        href: '/home',
        label: 'Home',
        icon: <HomeIcon />,
        iconAlt: 'Home logo',
    },
    {
        href: '/review',
        label: 'Review',
        icon: <UserGroupIcon />,
        iconAlt: 'Review Hackers logo',
    },
    {
        href: '/statistics',
        label: 'Statistics',
        icon: <ChartBarIcon />,
        iconAlt: 'Stats logo',
        disabled: true,
    },
    {
        href: '/schedule',
        label: 'Schedule',
        icon: <CalendarDaysIcon />,
        iconAlt: 'Schedule logo',
    },
];

const navLinks = [
    {
        href: '/home',
        label: 'Home',
        icon: <HomeIcon />,
        iconAlt: 'Home logo',
        active: true,
        disabled: false,
    },
    {
        href: '/team',
        label: 'Team',
        icon: <UserGroupIcon />,
        iconAlt: 'Team logo',
        active: false,
        disabled: false,
    },
    {
        href: '/schedule',
        label: 'Schedule',
        icon: <CalendarDaysIcon />,
        iconAlt: 'Schedule logo',
        active: false,
        disabled: false,
    },
    {
        href: '/projects',
        label: 'Project Gallery',
        icon: <InboxStackIcon />,
        iconAlt: 'Project gallery logo',
        active: false,
        disabled: false,
    },
    // {
    //     href: '#',
    //     label: 'Alerts',
    //     icon: <BellAlertIcon />,
    //     iconAlt: 'Alerts logo',
    //     active: false,
    //     disabled: true,
    // },
];

const adminLinks = [
    {
        href: '',
        label: 'Check-In',
        icon: <QrCodeIcon />,
        iconAlt: 'QR logo',
        active: false,
        disabled: false,
        onClick: true,
    },
];

export default function MobileBottomNav({
    initialData,
    className,
}: MobileBottomNavProps) {
    const [hideBottomNav, setHideBottom] = useState(false);

    const url = usePathname();

    useEffect(() => {
        for (const excludeURL of excludedUrls) {
            if (url.startsWith(excludeURL)) {
                return setHideBottom(true);
            }
            setHideBottom(false);
        }
    }, [url]);

    const [isEventTypeOptionsOpen, setIsEventTypeOptionsOpen] = useState(false);

    const closeSelectEventTypeOptions = () => {
        setIsEventTypeOptionsOpen(false);
    };

    const openSelectEventTypeOptions = () => {
        setIsEventTypeOptionsOpen(true);
    };

    return (
        <>
            {!hideBottomNav && (
                <div
                    className={clsx(
                        'flex h-20 w-screen flex-row gap-2 border-t border-t-neutral-600/30 bg-neutral-900/60 px-2 py-2 backdrop-blur-xl *:flex-1',
                        className
                    )}
                >
                    {initialData?.userRole === 'judge' ||
                    (isSparkjamProjectsArea(url) && !initialData) ? (
                        <>
                            {judgeNavLinks.map((link) => (
                                <NavLink
                                    key={link.href}
                                    href={link.href}
                                    label={link.label}
                                    icon={link.icon}
                                    iconAlt={link.iconAlt}
                                    platform="mobile"
                                    active={url.startsWith(link.href)}
                                />
                            ))}
                        </>
                    ) : initialData?.userRole === 'sponsor' ? (
                        <>
                            {sponsorNavLinks.map((link) => (
                                <NavLink
                                    key={link.href}
                                    href={link.href}
                                    label={link.label}
                                    icon={link.icon}
                                    iconAlt={link.iconAlt}
                                    platform="mobile"
                                    active={url.startsWith(link.href)}
                                />
                            ))}
                        </>
                    ) : (
                        <>
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.href}
                                    href={link.href}
                                    label={link.label}
                                    icon={link.icon}
                                    iconAlt={link.iconAlt}
                                    platform="mobile"
                                    active={url.startsWith(link.href)}
                                    disabled={link.disabled}
                                />
                            ))}

                            {hasAdminAccess(initialData?.userRole) &&
                                adminLinks.map((link) => (
                                    <NavLink
                                        key={link.href}
                                        href={link.href}
                                        onClick={
                                            link.onClick
                                                ? openSelectEventTypeOptions
                                                : undefined
                                        }
                                        label={link.label}
                                        icon={link.icon}
                                        iconAlt={link.iconAlt}
                                        platform="mobile"
                                        active={link.active}
                                        disabled={link.disabled}
                                    />
                                ))}
                        </>
                    )}
                </div>
            )}

            <SelectOption
                onClose={closeSelectEventTypeOptions}
                show={isEventTypeOptionsOpen}
            />
        </>
    );
}
