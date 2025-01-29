'use client';

import clsx from 'clsx';
import { NavLink } from './NavLink';
import { HomeIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/outline';
import { atom, useAtomValue } from 'jotai';

interface MobileBottomNavProps {
    className?: string;
}
export const hideBottomNavAtom = atom(false);

export default function MobileBottomNav({ className }: MobileBottomNavProps) {
    const hideBottomNav = useAtomValue(hideBottomNavAtom);

    return (
        <>
            {!hideBottomNav && (
                <div
                    className={clsx(
                        'w-screen *:flex-1 flex flex-row gap-2 bg-neutral-900/60 border-t border-t-neutral-600/30 px-2 py-2 h-20 backdrop-blur-xl',
                        className
                    )}
                >
                    <NavLink
                        href="#"
                        label="Home"
                        icon={<HomeIcon></HomeIcon>}
                        iconAlt="Home logo"
                        platform="mobile"
                        active={window?.location.pathname === '/home'}
                    ></NavLink>

                    <NavLink
                        href="#"
                        label="Team"
                        icon={<UserGroupIcon></UserGroupIcon>}
                        iconAlt="Team logo"
                        platform="mobile"
                        active={false}
                        disabled={true}
                    ></NavLink>

                    <NavLink
                        href="#"
                        label="Schedule"
                        icon={<CalendarDaysIcon></CalendarDaysIcon>}
                        iconAlt="Schedule logo"
                        platform="mobile"
                        active={false}
                        disabled={true}
                    ></NavLink>

                    <NavLink
                        href="#"
                        label="Alerts"
                        icon={<BellAlertIcon></BellAlertIcon>}
                        iconAlt="Alerts logo"
                        platform="mobile"
                        active={false}
                        disabled={true}
                    ></NavLink>
                </div>
            )}
        </>
    );
}
