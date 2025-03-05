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

import { useHydrateAtoms } from 'jotai/utils';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MergedUserData } from '@/app/(auth)/layout';

interface MobileTopNavProps {
    className?: string;
    initialData?: MergedUserData;
}

const excludedUrls = [
    '/application',
    '/admin/qr/meal/D1L',
    '/admin/qr/meal/D1D',
    '/admin/qr/hackathon',
];

export default function MobileTopNav({
    initialData,
    className,
}: MobileTopNavProps) {
    const [hideTopNav, setHideTopNav] = useState(false);
    const url = usePathname();

    useEffect(() => {
        for (const excludeURL of excludedUrls) {
            if (url.startsWith(excludeURL)) {
                document.body.style.setProperty('--paddingTop', '0rem');
                return setHideTopNav(true);
            }
            setHideTopNav(false);
            document.body.style.setProperty('--paddingTop', '4rem');
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
                        <div className="my-auto flex flex-row gap-3">
                            <Image
                                src="/login/sparkcheffrizz.webp"
                                alt="Sparky wearing a chef\'s hat"
                                width={36}
                                height={36}
                                className="h-9 w-9 rounded-lg"
                            ></Image>

                            <div className="flex flex-col gap-2">
                                <span className="line-clamp-1 text-sm leading-none font-medium text-white">
                                    JourneyHacks 2025
                                </span>
                                <span className="line-clamp-1 text-sm leading-none text-white/60">
                                    February 14, 2025
                                </span>
                            </div>
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <img
                                    width={36}
                                    height={36}
                                    alt="Default avatar for the user"
                                    src={
                                        initialData?.image ??
                                        '/sidebar/default-avatar.webp'
                                    }
                                    className="aspect-square h-10 w-10 rounded-full"
                                ></img>
                            </PopoverTrigger>
                            <PopoverContent
                                sideOffset={8}
                                side="bottom"
                                className="z-200"
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
                                    onClick={async () => {
                                        await signOut({
                                            redirectTo: '/',
                                        });
                                    }}
                                ></NavLink>
                                <PopoverPrimitive.Arrow className="fill-neutral-850 mr-4 shadow-lg" />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            )}
        </>
    );
}
