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

const DISCORD_LINK = 'https://discord.com/invite/U5q6RkHHtA/login';

export default function DiscordCard() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderDescription>Events</CardHeaderDescription>
                    <CardHeaderTitle>Join the Surge Discord!</CardHeaderTitle>
                </CardHeaderColumn>
                <Link href={DISCORD_LINK} target="_blank">
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
                <Link href={DISCORD_LINK} target="_blank">
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
