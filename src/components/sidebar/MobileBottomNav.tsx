'use client';

import clsx from 'clsx';
import { NavLink } from './NavLink';
import { HomeIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/outline';

import { redirect, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QrCodeIcon } from '@heroicons/react/24/solid';
import { MergedUserData } from '@/app/(auth)/layout';
import SelectOption from '@/app/(auth)/admin/selectoption/components/SelectOption';
import SelectMeal from '@/app/qr/checkin_components/SelectMeal';

interface MobileBottomNavProps {
    className?: string;
    initialData?: MergedUserData;
}

const excludedUrls = ['/application'];
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

    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

    const toggleOptions = () => {
        setIsOptionsOpen(!isOptionsOpen);
    };

    const [checkInType, setCheckInType] = useState<string>('');
    //
    // const [isMealsOpen, setIsMealsOpen] = useState(false);
    //
    // const toggleMeals = () => {
    //     setIsMealsOpen(true);
    // };
    //
    // const closeMeals = () => {
    //     setIsMealsOpen(false);
    //     setCheckInType('');
    // };
    //
    // const [isWorkshopsOpen, setIsWorkshopsOpen] = useState(false);
    //
    // const toggleWorkshops = () => {
    //     setIsWorkshopsOpen(true);
    // };
    //
    // const closeWorkshops = () => {
    //     setIsWorkshopsOpen(false);
    //     setCheckInType('');
    // };

    useEffect(() => {
        if (checkInType === 'Meal Check-in') {
            redirect('/qr/meal/D1L');
            // } else if (checkInType === 'Workshop Check-in') {
            //     toggleWorkshops();
        } else if (checkInType === 'Hackathon Check-in') {
            redirect('/qr/hackathon');
        }
    }, [checkInType]);

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
                        active={url.startsWith('/home')}
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

                    {initialData?.userRole === 'admin' && (
                        <NavLink
                            href=""
                            onClick={toggleOptions}
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
            <div>
                <div
                    className={`fixed w-full inset-0 z-[200] bg-black bg-opacity-50 transition-opacity duration-300 ${isOptionsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={toggleOptions}
                >
                    <div
                        className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out transform ${isOptionsOpen ? 'translate-y-0' : 'translate-y-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SelectOption setCheckInType={setCheckInType} />
                    </div>
                </div>

                {/*<div*/}
                {/*    className={`fixed inset-0 z-[200] bg-black bg-opacity-50 transition-opacity duration-300 ${isMealsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}*/}
                {/*    onClick={closeMeals}*/}
                {/*>*/}
                {/*    <div*/}
                {/*        className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out transform ${isMealsOpen ? 'translate-y-0' : 'translate-y-full'}`}*/}
                {/*        onClick={(e) => e.stopPropagation()}*/}
                {/*    >*/}
                {/*        <SelectMeal/>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/*<div*/}
                {/*    className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${isWorkshopsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}*/}
                {/*    onClick={closeWorkshops}*/}
                {/*>*/}
                {/*    <div*/}
                {/*        className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out transform ${isWorkshopsOpen ? 'translate-y-0' : 'translate-y-full'}`}*/}
                {/*        onClick={(e) => e.stopPropagation()}*/}
                {/*    >*/}
                {/*        <SelectWorkshop />*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>
        </>
    );
}
