import clsx from 'clsx';
import Image from 'next/image';
import { NavLink } from './NavLink';
import { HomeIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/outline';

interface DesktopNavProps {
    className?: string;
}

export default function DesktopNav({ className }: DesktopNavProps) {
    return (
        <div
            className={clsx(
                'h-screen bg-neutral-950 p-5 max-w-[300px]',
                className
            )}
        >
            <div className="flex flex-col h-full justify-between">
                <div className="flex flex-col gap-5">
                    <div className="relative aspect-[5/3] rounded-xl overflow-hidden border border-neutral-800">
                        <div className="absolute top-0 bg-neutral-900/50 backdrop-blur-lg flex flex-row gap-3 w-full p-2">
                            <Image
                                src="/login/sparkcheffrizz.png"
                                alt="Sparky wearing a chef\'s hat"
                                width={36}
                                height={36}
                                className="rounded-lg w-8 h-8 pointer-events-none"
                            ></Image>

                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium leading-none text-white">
                                    JourneyHacks 2025
                                </span>
                                <span className="text-sm leading-none text-white/60">
                                    February 14, 2025
                                </span>
                            </div>
                        </div>

                        <Image
                            src="/sidebar/stormy-sparky-header.png"
                            alt="Stormy and Sparky cooking"
                            width={1080}
                            height={1080}
                            className="w-full h-full object-cover"
                        ></Image>
                    </div>

                    <div className="links flex-1 flex flex-col gap-1">
                        <NavLink
                            href="#"
                            label="Home"
                            icon={<HomeIcon></HomeIcon>}
                            iconAlt="Home logo"
                            platform="desktop"
                            active={true}
                        ></NavLink>
                        <NavLink
                            href="#"
                            label="Team"
                            icon={<UserGroupIcon></UserGroupIcon>}
                            iconAlt="Team logo"
                            platform="desktop"
                            active={false}
                        ></NavLink>

                        <NavLink
                            href="#"
                            label="Schedule"
                            icon={<CalendarDaysIcon></CalendarDaysIcon>}
                            iconAlt="Schedule logo"
                            platform="desktop"
                            active={false}
                        ></NavLink>

                        <NavLink
                            href="#"
                            label="Alerts"
                            icon={<BellAlertIcon></BellAlertIcon>}
                            iconAlt="Alerts logo"
                            platform="desktop"
                            active={false}
                        ></NavLink>
                    </div>
                </div>

                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row gap-3 items-center    ">
                        <Image
                            src="/login/sparkcheffrizz.png"
                            alt="Sparky wearing a chef\'s hat"
                            width={36}
                            height={36}
                            className="rounded-full w-9 h-9"
                        ></Image>

                        <div className="flex flex-col gap-2">
                            <span className="text-white font-medium text-base leading-none">
                                Hacker name
                            </span>
                            <span className="text-white/60 text-sm leading-none">
                                User type
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
