import clsx from 'clsx';
import Image from 'next/image';
import { NavLink } from './NavLink';
import { HomeIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { PopoverArrow } from '@radix-ui/react-popover';

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

                <Popover>
                    <PopoverTrigger asChild>
                        <button className="group flex flex-row justify-between items-center hover:bg-neutral-750/30 rounded-lg px-3 py-2.5 gap-5 transition-colors">
                            <div className="flex flex-row gap-4 items-center">
                                <Image
                                    alt="Default avatar for the user"
                                    src="/sidebar/default-avatar.png"
                                    width={32}
                                    height={32}
                                    className="rounded-full w-9 h-9"
                                ></Image>

                                <div className="flex flex-col gap-2">
                                    <span className="text-white font-medium text-base leading-tight text-left line-clamp-1">
                                        Super duper long name
                                    </span>
                                    <span className="text-white/60 text-sm leading-none text-left line-clamp-1">
                                        User type
                                    </span>
                                </div>
                            </div>
                            <ChevronRightIcon
                                width={28}
                                height={28}
                                className="text-white/60 group-hover:text-white"
                            />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent sideOffset={8} side="right">
                        <NavLink
                            href="#"
                            label="Sign out"
                            icon={
                                <ArrowLeftEndOnRectangleIcon></ArrowLeftEndOnRectangleIcon>
                            }
                            iconAlt="Sign out logo"
                            platform="desktop"
                            variant="error"
                            active={null}
                        ></NavLink>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
