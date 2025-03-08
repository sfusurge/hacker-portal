import React from 'react';

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
    totalItems?: number;
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
    totalItems = 4,
}: TeammateItemProps) {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
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
                    (index !== totalItems - 1 && !isMobile && (
                        <hr className="border-neutral-700/20" />
                    ))}
            </>
        );
    }

    return (
        <>
            <li className="flex justify-between gap-4">
                <div className="flex flex-1 gap-4 overflow-hidden">
                    <img
                        alt="Default avatar for the user"
                        src={image ?? '/sidebar/default-avatar.webp'}
                        width={32}
                        height={32}
                        className="h-11 w-11 rounded-full object-cover"
                    />
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <p className="truncate font-medium">
                            {isMobile ? firstName : name}{' '}
                            {currentUser && (
                                <span className="font-normal text-white/60">
                                    (You)
                                </span>
                            )}
                        </p>
                        <p className="truncate text-sm font-normal">{email}</p>
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
            {index !== totalItems - 1 && isMobile && (
                <hr className="border-neutral-700/20" />
            )}
            {index !== 3 && !isMobile && (
                <hr className="border-neutral-700/20" />
            )}
        </>
    );
}
