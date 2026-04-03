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
import { motion, AnimatePresence } from 'motion/react';

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
            <div className="hidden h-full md:block">{children}</div>

            {!hideTopNav && (
                <div
                    className={clsx(
                        'h-20 w-screen border-b border-b-neutral-600/30 bg-neutral-900/60 px-4 py-5 backdrop-blur-xl md:hidden',
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
            <AnimatePresence>
                {!hideTopNav && showMobileSidebar && (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Close sidebar backdrop"
                            className="fixed inset-0 top-20 z-[85] bg-black/40 md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMobileSidebar(false)}
                        />

                        <motion.div
                            className="fixed top-20 bottom-0 left-0 z-[90] w-[280px] bg-neutral-950 shadow-2xl md:hidden"
                            initial={{ x: -24, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -24, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                            <div className="h-full md:hidden">{children}</div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
