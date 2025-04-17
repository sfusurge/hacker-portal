'use client';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { getStatusVariant } from '@/lib/application-status';
import Link from 'next/link';
import { LinkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
    Card,
    CardHeader,
    CardHeaderColumn,
    CardContent,
    CardFooter,
    CardHeaderDescription,
    CardHeaderTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import JoinTeam from '@/components/team/NoTeam/TeamOption';
import { UserData } from '@/db/schema/users/users';
import { StatusEnum } from '@/db/schema/applications';
import { inferProcedureOutput } from '@trpc/server';
import { AppRouter } from '@/server/appRouter';
import { TeamCardSkeleton } from '@/components/home/Skeletons';
import { copyToClipboard } from '@/lib/copy-to-clipboard';

type TeamType = inferProcedureOutput<AppRouter['teams']['getCurrentTeam']>;

type TeamMemberType =
    NonNullable<TeamType> extends { members: (infer U)[] } ? U : never;

function TeamMemberItem({
    member,
    userData,
}: {
    member: TeamMemberType;
    userData: UserData;
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <img
                    src={
                        // member.image ||
                        '/teams/single-otter.webp'
                    }
                    alt={`${member.firstName || 'Team member'}`}
                    className="h-7 w-7 shrink-0 rounded-full bg-neutral-700 object-cover"
                />
                <div className="min-w-0 flex-1">
                    <p className="truncate">
                        {member.firstName || 'Unknown Member'}{' '}
                        {member.email == userData?.email && (
                            <span className="font-normal text-white/60">
                                (You)
                            </span>
                        )}
                    </p>
                </div>
            </div>
            <div className="shrink-0">
                <Chip
                    variant={getStatusVariant(
                        (member.currentStatus ?? 'N/A') as StatusEnum
                    )}
                >
                    {member.currentStatus || 'Not Submitted'}
                </Chip>
            </div>
        </div>
    );
}

export default function TeamCard({
    userData,
    hackathonId,
    team,
}: {
    userData: UserData;
    hackathonId: number;
    team: TeamType | null | undefined;
}) {
    const [copied, setCopied] = useState(false);

    if (!team) {
        return (
            <Card className="col-span-4">
                <CardContent className="gap-6">
                    <div className="max-w-auto flex w-full justify-center">
                        <Image
                            src={'/login/application-review.webp'}
                            alt="Sad otter alone in the grass"
                            width="365"
                            height="144"
                            className="w-full max-w-56"
                        />
                    </div>
                    <div
                        className={
                            'flex w-full flex-col items-center gap-2 text-left md:text-center'
                        }
                    >
                        <h1 className="text-xl font-semibold">
                            You&apos;re not in a team yet! 🥺
                        </h1>
                        <p className="px-2 font-light text-pretty text-white/60">
                            Join an existing team or create a new one to view
                            your team&apos;s information here.
                        </p>
                    </div>
                    <JoinTeam compact={true} hackathonId={hackathonId} />
                </CardContent>
            </Card>
        );
    }

    const handleCopyLink = async () => {
        const inviteLink = `https://portal.sfusurge.com/invite/${team.displayId}`;
        await copyToClipboard(inviteLink, 'link', setCopied);
    };

    return (
        <Card className="col-span-4 h-full">
            <CardHeader className="gap-5">
                <CardHeaderColumn>
                    <CardHeaderDescription>
                        Your Team ({team.members.length}/{team.maxMembersCount}{' '}
                        members)
                    </CardHeaderDescription>
                    <CardHeaderTitle>{team.name}</CardHeaderTitle>
                </CardHeaderColumn>
                <Link href="/team" className="flex-shrink-0">
                    <Button
                        variant="default"
                        size="cozy"
                        hierarchy="primary"
                        className="block"
                    >
                        View team
                    </Button>
                </Link>
            </CardHeader>

            <CardContent className="gap-3">
                {team.members.map((member: TeamMemberType, index) => (
                    <TeamMemberItem
                        key={member.userId || index}
                        member={member}
                        userData={userData}
                    />
                ))}
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
                <div className="flex w-full items-center justify-between">
                    <span className="text-sm text-white/60">
                        Invite Teammates
                    </span>
                </div>
                <div className="flex w-full gap-3">
                    <Input
                        type="text"
                        value={`https://portal.sfusurge.com/invite/${team.displayId}`}
                        readOnly
                        className={cn(
                            `flex-shrink flex-grow cursor-copy truncate border border-neutral-700/30 bg-neutral-800 py-0 text-white/60`
                        )}
                        onClick={handleCopyLink}
                        aria-label="Team Invite Link"
                    />
                    <Button
                        variant="default"
                        size="compact"
                        hierarchy="secondary"
                        className={cn(
                            'cursor-copy text-nowrap',
                            copied ? 'bg-neutral-700/60' : ''
                        )}
                        onClick={handleCopyLink}
                        leadingIcon="true"
                        leadingIconChild={<LinkIcon className="h-4 w-4" />}
                    >
                        {copied ? 'Copied!' : 'Copy link'}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
