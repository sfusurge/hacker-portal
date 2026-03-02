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
    href: '/announcements',
    label: 'Announcements',
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
                        <div className="my-auto flex flex-row gap-3">
                            <Image
                                src="/dashboard/sillyhackshead.png"
                                alt="JourneyHacks 2026 Logo"
                                width={36}
                                height={36}
                                className="h-9 w-9 rounded-lg"
                            />

                            <div className="flex flex-col gap-2">
                                <span className="line-clamp-1 text-sm leading-none font-medium text-white">
                                    SillyHacks 2026
                                </span>
                                <span className="line-clamp-1 text-sm leading-none text-white/60">
                                    April 1, 2026
                                </span>
                            </div>
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
