'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import Image from 'next/image';
import { redirect, useRouter } from 'next/navigation';

const DISCORD_LINK = 'https://discord.com/invite/U5q6RkHHtA/login';

export default function DiscordCard() {
    const handleClick = () => {
        redirect('https://discord.com/invite/U5q6RkHHtA/login');
    };
    return (
        <div className="bg-neutral-900 rounded-xl border border-neutral-600/30">
            <div className="p-5 flex flex-row items-center justify-between w-full border-b border-b-neutral-600/30">
                <div className="flex flex-col gap-2.5">
                    <span className="text-sm text-white/60 font-medium leading-none">
                        Stay in the Loop
                    </span>
                    <h2 className="text-white text-xl font-semibold leading-tight">
                        Join the Surge Discord!
                    </h2>
                </div>
                <Button
                    size="cozy"
                    variant="default"
                    hierarchy="primary"
                    className="hidden md:block"
                    onClick={handleClick}
                >
                    <Link href={DISCORD_LINK} target="_blank">
                        Join
                    </Link>
                </Button>
            </div>
            <div className="text-center p-5 pb-0 md:p-8 md:pb-0">
                <Image
                    src="/dashboard/join-our-discord.webp"
                    width={1444}
                    height={1276}
                    alt="A bunch of otter heads surrounding a phone"
                    className="max-w-96 w-full h-auto mx-auto pointer-events-none"
                ></Image>
            </div>
            <div className="p-5 border-t border-t-neutral-600/30 md:hidden">
                <Button
                    size="cozy"
                    variant="default"
                    hierarchy="primary"
                    className="w-full"
                    onClick={handleClick}
                >
                    <Link href={DISCORD_LINK}>Join Discord server</Link>
                </Button>
            </div>
        </div>
    );
}
