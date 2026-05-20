'use client';

import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { Button } from '@/components/ui/button';
import {
    isAudienceVotingEnabled,
    isAudienceVotingWindowOpen,
} from '@/lib/audienceVoting';
import { useAtomValue } from 'jotai';
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
    const hackathon = useAtomValue(hackathonAtom);
    const votingEnabled = isAudienceVotingEnabled(hackathon);

    const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
    const [hasVoted, setHasVoted] = useState(alreadyVoted);
    const userTeam = trpc.teams.getCurrentTeam.useQuery(
        { hackathonId: hackathonId },
        { enabled: votingEnabled }
    );

    if (!votingEnabled) {
        return null;
    }

    const isOnSameTeam = userTeam.data?.id === teamId;
    const isVotingTimeActive = isAudienceVotingWindowOpen(
        Date.now(),
        hackathon.audienceVotingOpen,
        hackathon.audienceVotingCloses
    );
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
