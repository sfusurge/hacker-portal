'use client';

import Image from 'next/image';
import clsx from 'clsx';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { NavLink } from './NavLink';
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAtom, useAtomValue } from 'jotai';
import { MergedUserData, userAtom } from '@/app/(auth)/layout';
import { useHydrateAtoms } from 'jotai/utils';

interface MobileTopNavProps {
    className?: string;
    initialData?: MergedUserData;
}

export default function MobileTopNav({
    initialData = undefined,
    className,
}: MobileTopNavProps) {
    //    useHydrateAtoms([[userAtom, initialData]]);
    //    const userData = useAtomValue(userAtom);

    return (
        <div
            className={clsx(
                'w-screen bg-neutral-900/60 border-b border-b-neutral-600/30 px-4 py-5 h-20 backdrop-blur-xl',
                className
            )}
        >
            <div className="flex flex-row items-center w-full justify-between">
                <div className="flex flex-row gap-3 my-auto">
                    <Image
                        src="/login/sparkcheffrizz.png"
                        alt="Sparky wearing a chef\'s hat"
                        width={36}
                        height={36}
                        className="rounded-lg w-9 h-9"
                    ></Image>

                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium line-clamp-1 leading-none text-white">
                            JourneyHacks 2025
                        </span>
                        <span className="text-sm leading-none line-clamp-1 text-white/60">
                            February 14, 2025
                        </span>
                    </div>
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        {/* userData?.image ??  */}
                        <Image
                            width={36}
                            height={36}
                            alt="Default avatar for the user"
                            src={'/sidebar/default-avatar.png'}
                            className="w-10 h-10 aspect-square rounded-full"
                        ></Image>
                    </PopoverTrigger>
                    <PopoverContent
                        sideOffset={8}
                        side="bottom"
                        className="z-[200]"
                    >
                        <NavLink
                            href="#"
                            label="Sign out"
                            icon={
                                <ArrowLeftEndOnRectangleIcon></ArrowLeftEndOnRectangleIcon>
                            }
                            iconAlt="Sign out logo"
                            platform="desktop"
                            variant="error"
                            className="px-2"
                        ></NavLink>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
