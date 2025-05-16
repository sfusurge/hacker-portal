'use client';

import clsx from 'clsx';
import { NavLink } from './NavLink';
import { HomeIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/outline';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QrCodeIcon } from '@heroicons/react/24/solid';
import { UserData } from '@/db/schema/users/users';
import SelectOption from '@/app/(auth)/admin/qr/checkin_components/SelectOption';

interface MobileBottomNavProps {
    className?: string;
    initialData?: UserData;
}

const excludedUrls = ['/application', '/admin/qr'];

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
                    <NavLink
                        href="/home"
                        label="Home"
                        icon={<HomeIcon></HomeIcon>}
                        iconAlt="Home logo"
                        platform="mobile"
                        active={url.startsWith('/home')}
                    ></NavLink>

                    <NavLink
                        href="/team"
                        label="Team"
                        icon={<UserGroupIcon></UserGroupIcon>}
                        iconAlt="Team logo"
                        platform="mobile"
                    ></NavLink>

                    <NavLink
                        href="/schedule"
                        label="Schedule"
                        icon={<CalendarDaysIcon></CalendarDaysIcon>}
                        iconAlt="Schedule logo"
                        platform="mobile"
                        disabled={false}
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

                    {initialData?.userRole === 'admin' && (
                        <NavLink
                            href=""
                            onClick={openSelectEventTypeOptions}
                            label="Check-In"
                            icon={<QrCodeIcon></QrCodeIcon>}
                            iconAlt="QR logo"
                            platform="mobile"
                            active={false}
                            disabled={false}
                        ></NavLink>
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
