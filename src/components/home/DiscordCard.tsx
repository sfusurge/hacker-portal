'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
    Card,
    CardHeader,
    CardHeaderTitle,
    CardHeaderDescription,
    CardContent,
    CardFooter,
    CardHeaderColumn,
} from '@/components/ui/card';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { defaultEventPagePayload } from '@/components/home/eventPageConfig';
import { eventDiscordUrlForStatus } from '@/lib/eventDiscord';
import { cn } from '@/lib/utils';
import { useAtomValue } from 'jotai';

type DiscordCardProps = {
    applicationStatus?: string;
    className?: string;
};

export default function DiscordCard({
    applicationStatus,
    className,
}: DiscordCardProps) {
    const hackathon = useAtomValue(hackathonAtom);
    const discordLink = eventDiscordUrlForStatus(
        applicationStatus,
        hackathon?.eventPagePayload
    );
    const payload =
        hackathon?.eventPagePayload ??
        (hackathon?.hackathonName
            ? defaultEventPagePayload(hackathon.hackathonName)
            : null);
    const eventDisplayName = payload?.name ?? hackathon?.hackathonName;
    const hackathonIconSrc = payload?.iconSrc;
    const isAccepted = applicationStatus === 'Accepted';
    const headerTitle =
        isAccepted && eventDisplayName
            ? `Join the ${eventDisplayName} Discord!`
            : 'Join the Surge Discord!';

    return (
        <Card className={cn('h-full', className)}>
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderDescription>Your Events</CardHeaderDescription>
                    <CardHeaderTitle>{headerTitle}</CardHeaderTitle>
                </CardHeaderColumn>
                <Link href={discordLink} target="_blank">
                    <Button
                        size="cozy"
                        variant="default"
                        hierarchy="primary"
                        className="hidden md:block"
                    >
                        Join
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="flex h-full items-center justify-center pb-4 text-center">
                {isAccepted && hackathonIconSrc ? (
                    <Image
                        src={hackathonIconSrc}
                        alt={`${eventDisplayName ?? 'Hackathon'} logo`}
                        width={320}
                        height={320}
                        className="pointer-events-none h-32 w-32 rounded-xl object-contain"
                    />
                ) : (
                    <Image
                        src="/dashboard/join-our-discord.webp"
                        width={1444}
                        height={1276}
                        alt="A bunch of otter heads surrounding a phone"
                        className="pointer-events-none mx-auto h-auto w-full max-w-96"
                    />
                )}
            </CardContent>
            <CardFooter className="md:hidden">
                <Link href={discordLink} target="_blank">
                    <Button
                        size="cozy"
                        variant="default"
                        hierarchy="primary"
                        className="w-full"
                    >
                        Join Discord server
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
