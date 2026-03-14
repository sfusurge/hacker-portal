'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import AudienceChoiceDialog from './judge/AudienceChoiceDialog';
import { trpc } from '@/trpc/client';

interface VoteButtonProps {
    projectTitle: string;
    teamId: number;
    hackathonId: number;
    userId: number;
    alreadyVoted: boolean;
    applicationStatus: string | undefined;
}

export default function VoteButton({
    projectTitle,
    teamId,
    hackathonId,
    userId,
    alreadyVoted,
    applicationStatus,
}: VoteButtonProps) {
    const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
    const [hasVoted, setHasVoted] = useState(alreadyVoted);
    const userTeam = trpc.teams.getCurrentTeam.useQuery({
        hackathonId: hackathonId,
    });

    const now = new Date();
    const pstNow = new Date(
        now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
    );
    const startTime = new Date('2026-01-01T00:00:00-08:00');
    const endTime = new Date('2026-05-24T23:59:59-07:00');

    const isOnSameTeam = userTeam.data?.id === teamId;

    const isVotingTimeActive = pstNow >= startTime && pstNow <= endTime;

    const isUserRoleAccepted = applicationStatus === 'Accepted';

    const isDisabled =
        hasVoted || isOnSameTeam || !isVotingTimeActive || !isUserRoleAccepted;

    return (
        <>
            <Button
                variant="brand"
                disabled={isDisabled}
                hierarchy="primary"
                size="cozy"
                className="w-full whitespace-nowrap md:w-max"
                onClick={
                    isDisabled ? undefined : () => setIsVoteDialogOpen(true)
                }
            >
                {hasVoted
                    ? "You've already voted!"
                    : isOnSameTeam
                      ? "Can't vote for your own team!"
                      : !isVotingTimeActive
                        ? "Voting hasn't started yet!"
                        : !isUserRoleAccepted
                          ? 'Only accepted participants can vote!'
                          : 'Vote for audience choice!'}
            </Button>

            <AudienceChoiceDialog
                open={isVoteDialogOpen}
                onOpenChange={setIsVoteDialogOpen}
                projectTitle={projectTitle}
                setHasVoted={setHasVoted}
                teamId={teamId}
                hackathonId={hackathonId}
                userId={userId}
            />
        </>
    );
}
