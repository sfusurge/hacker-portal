'use client';

import { Button } from '@/components/ui/button';
import JoinTeamButton from '@/components/team/NoTeam/JoinTeamButton';
import { ExclamationTriangleIcon } from '@heroicons/react/16/solid';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

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
    const [open, handleOpenChange] = useState(isOpen);
    const router = useRouter();

    const handleClose = () => {
        handleOpenChange(false);
        router.push('/team');
    };

    if (!team) {
        return (
            <Dialog
                open={open}
                onOpenChange={(isOpen) => {
                    if (!isOpen) handleClose();
                    else handleOpenChange(isOpen);
                }}
            >
                <DialogContent className="gap-6 p-6 sm:max-w-[22.5rem]">
                    <DialogHeader>
                        <div className="bg-danger-900/30 flex h-12 w-12 items-center justify-center rounded-full">
                            <ExclamationCircleIcon className="text-danger-500 h-6 w-6" />
                        </div>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        <DialogTitle className="text-base font-semibold">
                            Invalid invitation link
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-normal text-white/60">
                            This invitation link is invalid or expired. Please
                            check the link or request a new link from your
                            teammates.
                        </DialogDescription>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="brand"
                            size="cozy"
                            hierarchy="primary"
                            className="w-full"
                            onClick={handleClose}
                        >
                            Return to team page
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    const isTeamFull = team.members.length >= team.maxMembersCount;

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) handleClose();
                else handleOpenChange(isOpen);
            }}
        >
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
                        <Button
                            variant="default"
                            size="cozy"
                            hierarchy="secondary"
                            className="w-full"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <JoinTeamButton
                            teamDisplayId={displayId}
                            className="w-full"
                            disabled={hasTeam !== null || isTeamFull}
                        />

                        {(hasTeam || isTeamFull) && (
                            <div className="col-span-2 mt-2">
                                <span className="text-danger-400 flex items-center justify-center gap-2 text-center text-xs text-pretty">
                                    <ExclamationTriangleIcon className="text-danger-500 h-4 w-4" />
                                    {hasTeam
                                        ? "You can't join because you have a team."
                                        : "You can't join this team because it's full."}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
