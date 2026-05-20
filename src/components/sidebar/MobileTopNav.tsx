'use client';

import clsx from 'clsx';
import { cn } from '@/lib/utils';
import { Bars3Icon, UserIcon } from '@heroicons/react/24/outline';
import { MegaphoneIcon } from '@heroicons/react/24/solid';
import { NavLink } from './NavLink';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { UserData } from '@/server/routers/usersRouter';
import { motion, AnimatePresence } from 'motion/react';
import { useAtomValue } from 'jotai';
import { unreadLabelAtom } from '@/app/(auth)/ClientContext';

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

const PAGE_TITLE_MAP: { prefix: string; label: string }[] = [
    { prefix: '/announcements', label: 'Announcements' },
    { prefix: '/schedule', label: 'Schedule' },
    { prefix: '/projects', label: 'Project Gallery' },
    { prefix: '/home', label: 'Home' },
    { prefix: '/team/submit', label: 'Submission to SparkJam 2026' },
    { prefix: '/team', label: 'Team' },
    { prefix: '/profile', label: 'Profile' },
];

function getPageTitle(pathname: string): string {
    for (const { prefix, label } of PAGE_TITLE_MAP) {
        if (pathname.startsWith(prefix)) return label;
    }
    return '';
}

/** above this between down/up counts as scroll/drag, not an outside tap. */
const OUTSIDE_TAP_MAX_MOVE_PX = 14;

export default function MobileTopNav({
    className,
    children,
}: MobileTopNavProps) {
    const [hideTopNav, setHideTopNav] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const url = usePathname();
    const outsidePointerRef = useRef<{
        id: number;
        x: number;
        y: number;
    } | null>(null);
    const unreadCount = useAtomValue(unreadLabelAtom);

    /** tap outside drawer closes, drag/scroll does not */
    useEffect(() => {
        if (!showMobileSidebar || hideTopNav) return;

        const clear = () => {
            outsidePointerRef.current = null;
        };

        const onPointerDown = (e: PointerEvent) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            outsidePointerRef.current = {
                id: e.pointerId,
                x: e.clientX,
                y: e.clientY,
            };
        };

        const onPointerUp = (e: PointerEvent) => {
            const start = outsidePointerRef.current;
            if (!start || e.pointerId !== start.id) return;
            clear();

            const dx = Math.abs(e.clientX - start.x);
            const dy = Math.abs(e.clientY - start.y);
            if (dx > OUTSIDE_TAP_MAX_MOVE_PX || dy > OUTSIDE_TAP_MAX_MOVE_PX) {
                return;
            }

            const sidebar = document.querySelector(
                '[data-mobile-sidebar-drawer]'
            );
            const topNav = document.querySelector('[data-mobile-top-nav]');
            const t = e.target;
            if (!(t instanceof Node)) return;
            if (sidebar?.contains(t)) return;
            if (topNav?.contains(t)) return;

            setShowMobileSidebar(false);
        };

        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('pointerup', onPointerUp, true);
        document.addEventListener('pointercancel', clear, true);

        return () => {
            document.removeEventListener('pointerdown', onPointerDown, true);
            document.removeEventListener('pointerup', onPointerUp, true);
            document.removeEventListener('pointercancel', clear, true);
        };
    }, [showMobileSidebar, hideTopNav]);

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
                    data-mobile-top-nav
                    className={clsx(
                        'fixed inset-x-0 top-0 z-100 h-20 w-full min-w-0 border-b border-b-neutral-600/30 bg-neutral-900/60 px-4 py-5 backdrop-blur-xl md:hidden',
                        className
                    )}
                >
                    <div className="flex w-full flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
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
                            <span
                                className="pt-2 text-base font-medium text-white"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowMobileSidebar((prev) => !prev);
                                }}
                            >
                                {getPageTitle(url)}
                            </span>
                        </div>

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
                                badge={unreadCount}
                                className={cn(
                                    'bg-transparent hover:bg-transparent',
                                    url.startsWith(announcement.href)
                                        ? 'text-white'
                                        : 'text-white/60 hover:text-white'
                                )}
                            />
                        </div>
                    </div>
                </div>
            )}
            <AnimatePresence>
                {!hideTopNav && showMobileSidebar && (
                    <>
                        <motion.div
                            aria-hidden
                            className="pointer-events-none fixed inset-0 top-20 z-[85] bg-black/40 md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        <motion.div
                            data-mobile-sidebar-drawer
                            className="fixed top-20 bottom-0 left-0 z-[90] flex w-[280px] max-w-[min(280px,100vw)] touch-pan-y flex-col overflow-x-hidden overflow-y-hidden bg-neutral-950 shadow-2xl md:hidden"
                            initial={{ x: -24, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -24, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            style={{
                                touchAction: 'pan-y',
                                overscrollBehaviorX: 'none',
                                overscrollBehaviorY: 'contain',
                            }}
                        >
                            <div
                                className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain md:hidden"
                                style={{
                                    touchAction: 'pan-y',
                                    overscrollBehaviorX: 'none',
                                }}
                            >
                                {children}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
