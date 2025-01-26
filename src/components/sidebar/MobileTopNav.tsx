import Image from 'next/image';
import clsx from 'clsx';

interface MobileTopNavProps {
    className?: string;
}

export default function MobileTopNav({ className }: MobileTopNavProps) {
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
                        <span className="text-sm font-medium leading-none text-white">
                            JourneyHacks 2025
                        </span>
                        <span className="text-sm leading-none text-white/60">
                            February 14, 2025
                        </span>
                    </div>
                </div>
                <a href="" aria-label="User profile">
                    <Image
                        width={36}
                        height={36}
                        alt="Default avatar for the user"
                        src="/sidebar/default-avatar.png"
                        className="w-10 h-10 rounded-full bg-red-400"
                    ></Image>
                </a>
            </div>
        </div>
    );
}
