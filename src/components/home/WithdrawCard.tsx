'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

export default function WithdrawCard() {
    return (
        <>
            <div className="bg-neutral-900 flex flex-col rounded-xl border border-neutral-600/30 z-10">
                <div className="p-5 flex flex-row items-center justify-between w-full border-b border-b-neutral-600/30">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-white/60 font-medium leading-none">
                            Your Application Status
                        </span>
                        <h2
                            className={cn(
                                'text-xl font-semibold text-left text-brand-400'
                            )}
                        >
                            Withdrawn
                        </h2>
                    </div>
                </div>

                <div className="text-center flex md:flex-row flex-col gap-6 items-center flex-1 justify-between">
                    <div className="flex flex-col gap-2 text-start max-w-full md:pl-5 md:pr-5 p-5">
                        <h2 className="text-white text-lg font-semibold">
                            You’ve withdrawn your application to JourneyHacks.
                        </h2>

                        <h3 className="text-white/70">
                            {
                                'If you believe this is an error, please reach out to the organizing team '
                            }
                            <a
                                className="inline text-white underline hover:text-white/70"
                                href={'https://discord.gg/Rg4mwHvKjd'}
                            >
                                via our Discord server
                            </a>
                            .
                        </h3>
                    </div>

                    <Image
                        src="/login/sad-otter.webp"
                        width={699}
                        height={725}
                        className="max-w-[240px]"
                        alt="An otter has dropped their mint chocolate ice cream. They look distraught."
                    />
                </div>
            </div>
        </>
    );
}
