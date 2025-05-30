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

    return (
        <>
            <Button
                variant="brand"
                disabled={alreadyVoted}
                hierarchy="primary"
                size="cozy"
                className="w-full whitespace-nowrap md:w-max"
                onClick={() => setIsVoteDialogOpen(true)}
            >
                Voting is not open yet!
                {/* {!alreadyVoted ? (
                    <>
                        <span className="hidden sm:inline">Vote project for Audience Choice Award!</span>
                        <span className="hidden sm:inline">Vote project for Audience Choice Award!</span>
                        <span className="sm:hidden">Vote for Audience Choice</span>
                    </>
                ) : (
                    <>
                        <span className="hidden sm:inline">You have voted for a project</span>
                        <span className="sm:hidden">Already voted</span>
                    </>
                )} */}
            </Button>

            <AudienceChoiceDialog
                open={isVoteDialogOpen}
                onOpenChange={setIsVoteDialogOpen}
                projectTitle={projectTitle}
                teamId={teamId}
                hackathonId={hackathonId}
                userId={userId}
            />
        </>
    );
}
