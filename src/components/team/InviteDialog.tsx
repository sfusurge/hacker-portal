'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import JoinTeamButton from '@/components/team/NoTeam/JoinTeamButton';
import { ExclamationTriangleIcon } from '@heroicons/react/16/solid';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface TeamData {
    id: number;
    name: string;
    displayId: string;
    teamPictureUrl: string | null;
    members: Array<{
        userId: number;
        firstName: string | null;
    }>;
    maxMembersCount: number;
    hackathonId: number;
}

export default function InviteDialog({
    team,
    displayId,
    isOpen = true,
    hasTeam = null,
}: {
    team: TeamData | null;
    displayId: string;
    isOpen?: boolean;
    hasTeam?: TeamData | null;
}) {
    const router = useRouter();
    const [open, setOpen] = useState(isOpen);

    const handleOpenChange = (open: boolean) => {
        setOpen(open);
        if (!open) {
            router.push('/team');
        }
    };

    if (!team) {
        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[26.5rem]">
                    <DialogHeader>
                        <DialogTitle>Team Not Found</DialogTitle>
                        <DialogDescription>
                            The team you&apos;re trying to join doesn&apos;t
                            exist or the invite link is invalid.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <Link href="/team" className="w-full">
                            <Button
                                variant="default"
                                size="cozy"
                                hierarchy="secondary"
                                className="w-full"
                                onClick={() => setOpen(false)}
                            >
                                Go back home
                            </Button>
                        </Link>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const isTeamFull = team.members.length >= team.maxMembersCount;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="text-center sm:max-w-[26.5rem]">
                <div className="flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <img
                            src={team.teamPictureUrl ?? '/teams/default.webp'}
                            alt={`${team.name} logo`}
                            className="h-16 w-16 rounded-xl"
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="flex flex-col gap-2">
                            <p className="text-white/60">
                                You&apos;ve been invited to join
                            </p>
                            <DialogHeader>
                                <DialogTitle className="text-center text-3xl font-semibold">
                                    {team.name}
                                </DialogTitle>
                            </DialogHeader>
                        </div>
                        <div className="flex w-max items-center justify-center gap-3 rounded-full border-1 border-neutral-600/30 bg-neutral-900 px-2 py-3">
                            <div className="flex -space-x-1">
                                {team.members.map((member, index) => (
                                    <div
                                        key={index}
                                        className="h-5 w-5 overflow-hidden rounded-full"
                                    >
                                        <img
                                            src="/teams/single-otter.webp"
                                            alt={`${member.firstName || 'Team'}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs text-white/60">
                                {team.members.length}/{team.maxMembersCount}{' '}
                                joined
                            </span>
                        </div>
                    </div>

                    <div className="grid w-full grid-cols-2 gap-3">
                        {!hasTeam && !isTeamFull ? (
                            <>
                                <Button
                                    variant="default"
                                    size="cozy"
                                    hierarchy="secondary"
                                    className="w-full"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <JoinTeamButton
                                    teamDisplayId={displayId}
                                    className="w-full"
                                />
                            </>
                        ) : (
                            <div className="col-span-2 flex flex-col gap-3">
                                <Button
                                    variant="brand"
                                    size="cozy"
                                    hierarchy="primary"
                                    className="w-full"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    {hasTeam
                                        ? 'Return to your team'
                                        : 'Return to join team'}
                                </Button>
                                <span className="text-danger-400 flex items-center justify-center gap-2 text-center text-xs text-pretty">
                                    <ExclamationTriangleIcon className="text-danger-500 h-4 w-4" />
                                    {hasTeam
                                        ? "You can't join this team because you're in a team"
                                        : "You can't join this team because it's full"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
