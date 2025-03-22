import React from 'react';
import { useState, useEffect } from 'react';
interface TeammateItemProps {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    submitted?: string;
    image?: string;
    currentUser?: boolean;
    index?: number;
    isPlaceholder?: boolean;
    maxMembersCount?: number;
}

export default function TeammateItem({
    firstName = 'Mia',
    lastName = 'Lancaster',
    name = firstName + ' ' + lastName,
    email = 'ml54@sfu.ca',
    submitted = 'Not Submitted',
    image = '/pfp_placeholder.png',
    currentUser = false,
    index = 0,
    isPlaceholder = false,
    maxMembersCount = 4,
}: TeammateItemProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
        };

        checkScreenSize();

        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    if (isPlaceholder && isMobile) {
        return null;
    }

    if (isPlaceholder) {
        return (
            <>
                <li className="h-11"></li>
                {index == 3 ||
                    (index !== maxMembersCount - 1 && !isMobile && (
                        <hr className="border-neutral-700/20" />
                    ))}
            </>
        );
    }

    return (
        <>
            <li className="flex justify-between gap-4">
                <div className="flex flex-1 items-center gap-3 overflow-hidden md:gap-4">
                    <img
                        alt="Default avatar for the user"
                        src={image ?? '/teams/default.webp'}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover md:h-11 md:w-11"
                    />
                    <div className="flex flex-1 flex-col justify-around gap-1 overflow-hidden">
                        <p className="truncate text-sm font-medium md:text-base">
                            {isMobile ? firstName : name}{' '}
                            {currentUser && (
                                <span className="font-normal text-white/60">
                                    (You)
                                </span>
                            )}
                        </p>
                        <p className="truncate text-xs font-normal md:text-sm">
                            {email}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-4">
                    <span
                        className={`rounded-lg px-3 py-1 text-sm font-medium ${
                            submitted === 'Submitted'
                                ? 'bg-success-950 text-success-300'
                                : 'bg-neutral-800/90 text-white/60'
                        }`}
                    >
                        {submitted}
                    </span>
                </div>
            </li>
            {index !== maxMembersCount - 1 && isMobile && (
                <hr className="border-neutral-700/20" />
            )}
            {index !== 3 && !isMobile && (
                <hr className="border-neutral-700/20" />
            )}
        </>
    );
}
