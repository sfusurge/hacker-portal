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

type DiscordCardProps = {
    applicationStatus?: string;
};

const DISCORD_LINK_STANDARD = 'https://discord.com/invite/U5q6RkHHtA/login';
const DISCORD_LINK_ACCEPTED = 'https://discord.gg/mfn8YkPCnp';

export default function DiscordCard({ applicationStatus }: DiscordCardProps) {
    const discordLink =
        applicationStatus === 'Accepted'
            ? DISCORD_LINK_ACCEPTED
            : DISCORD_LINK_STANDARD;
    const headerTitle =
        applicationStatus === 'Accepted'
            ? 'Join the StormHacks Discord!'
            : 'Join the Surge Discord!';

    return (
        <Card className="h-full">
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
            <CardContent className="pb-0 text-center">
                <Image
                    src="/dashboard/join-our-discord.webp"
                    width={1444}
                    height={1276}
                    alt="A bunch of otter heads surrounding a phone"
                    className="pointer-events-none mx-auto h-auto w-full max-w-96"
                />
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
