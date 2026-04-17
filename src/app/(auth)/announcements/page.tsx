'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input/input';
import { eventDiscordUrlForStatus } from '@/lib/eventDiscord';
import { trpc } from '@/trpc/client';
import { useAtomValue } from 'jotai';
import { useState } from 'react';

export default function AnnouncementsPage() {
    const [query, setQuery] = useState('');
    const hackathon = useAtomValue(hackathonAtom);

    const { data: application } =
        trpc.applications.getCurrentApplication.useQuery(
            { hackathonId: hackathon?.id ?? 0 },
            { enabled: !!hackathon?.id }
        );

    const discordHref = eventDiscordUrlForStatus(application?.currentStatus);

    return (
        <>
            <h1 className="text-3xl font-semibold text-white">Announcements</h1>
            <div className="mt-10 mb-10 flex h-full flex-col gap-6 md:min-h-[calc(100vh-11rem)] xl:grid xl:grid-cols-12 xl:items-start xl:gap-8">
                <div className="h-full xl:col-span-8">
                    <Card className="h-full">
                        <CardContent className="gap-6 p-5 md:p-6">
                            <form
                                className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
                                onSubmit={(e) => e.preventDefault()}
                            >
                                <Input
                                    type="search"
                                    placeholder="Search announcements..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    icon={
                                        <MagnifyingGlassIcon className="h-5 w-5 shrink-0 opacity-60" />
                                    }
                                    className="h-11 rounded-xl border-neutral-600/50 bg-neutral-800/60 text-white placeholder:text-neutral-500 focus-visible:outline-none"
                                />
                                <Button
                                    type="submit"
                                    variant="brand"
                                    hierarchy="primary"
                                    size="cozy"
                                >
                                    Search
                                </Button>
                            </form>

                            <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                                <h2 className="text-xl font-semibold text-white">
                                    You have no announcements!
                                </h2>
                                <p className="text-pretty text-white/60">
                                    <Link
                                        href={discordHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-brand-400 hover:text-brand-300"
                                    >
                                        Join our Discord server
                                    </Link>{' '}
                                    to stay updated on our events.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="h-full pb-10 xl:col-span-4 xl:pb-0">
                    <Card className="h-full">
                        <CardContent className="flex flex-col items-center justify-center gap-10 text-center">
                            <Image
                                src="/dashboard/join-our-discord.webp"
                                width={1444}
                                height={1276}
                                alt="A bunch of otters announcing something"
                                className="pointer-events-none mx-auto h-auto w-full max-w-96"
                            />
                            <div className="flex flex-col gap-3">
                                <h2 className="text-2xl font-semibold text-white">
                                    {application?.currentStatus === 'Accepted'
                                        ? 'Join the StormHacks Discord Server!'
                                        : 'Join the Surge Discord Server!'}
                                </h2>
                                <p className="text-pretty text-white/60">
                                    Join the SFU Surge Discord server to stay
                                    updated on our events!
                                </p>
                            </div>
                            <Link
                                href={discordHref}
                                target="_blank"
                                className="w-full"
                            >
                                <Button
                                    size="cozy"
                                    variant="default"
                                    hierarchy="primary"
                                    className="w-full"
                                >
                                    Join the Surge Discord
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
