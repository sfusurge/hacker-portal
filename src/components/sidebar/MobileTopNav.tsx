'use client';

import clsx from 'clsx';
import {
    ArrowLeftEndOnRectangleIcon,
    Bars3Icon,
    MegaphoneIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import { NavLink } from './NavLink';
import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { UserData } from '@/server/routers/usersRouter';

interface MobileTopNavProps {
    className?: string;
    initialData?: UserData;
    children?: ReactNode;
}

const excludedUrls = ['/application', '/admin/qr'];

const announcement = {
    href: '/src/auth/annoucments/page.tsx',
    label: 'Announcement',
    icon: <MegaphoneIcon className="h-6 w-6" />,
    iconAlt: 'Announcement logo',
};

export default function MobileTopNav({
    className,
    children,
}: MobileTopNavProps) {
    const [hideTopNav, setHideTopNav] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const url = usePathname();

    useEffect(() => {
        for (const excludeURL of excludedUrls) {
            if (url.startsWith(excludeURL)) {
                document.body.style.setProperty('--paddingTop', '0rem');
                setShowMobileSidebar(false);
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
                        <NavLink
                            href="#"
                            label=""
                            icon={
                                <Bars3Icon className="h-6 w-6 text-white/80" />
                            }
                            iconAlt="Toggle sidebar"
                            platform="desktop"
                            className="justify-center px-0"
                            collapsed
                            onClick={(e) => {
                                e.preventDefault();
                                setShowMobileSidebar((prev) => !prev);
                            }}
                        />

                        <div className="flex items-center justify-end">
                            <NavLink
                                key={announcement.href}
                                href={announcement.href}
                                label={announcement.label}
                                icon={announcement.icon}
                                iconAlt={announcement.iconAlt}
                                platform="desktop"
                                active={url.startsWith(announcement.href)}
                                collapsed={true}
                            />
                        </div>
                    </div>
                </div>
            )}
            {!hideTopNav && showMobileSidebar && (
                <div className="fixed inset-0 top-20 z-[90] md:hidden">
                    <div className="h-full w-[280px] bg-neutral-950 shadow-2xl">
                        {children}
                    </div>
                </div>
            )}
        </>
    );
}
