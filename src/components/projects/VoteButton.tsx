'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import AudienceChoiceDialog from './judge/AudienceChoiceDialog';

interface VoteButtonProps {
    projectTitle: string;
    teamId: number;
    hackathonId: number;
    userId: number;
    alreadyVoted: boolean;
}

export default function VoteButton({
    projectTitle,
    teamId,
    hackathonId,
    userId,
    alreadyVoted,
}: VoteButtonProps) {
    const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
    const [hasVoted, setHasVoted] = useState(alreadyVoted);

    return (
        <>
            <Button
                variant="brand"
                disabled={hasVoted}
                hierarchy="primary"
                size="cozy"
                className="w-full whitespace-nowrap md:w-max"
                onClick={hasVoted ? undefined : () => setIsVoteDialogOpen(true)}
            >
                {hasVoted
                    ? "You've already voted!"
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
