'use client';

import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import VoteButton from '@/components/projects/VoteButton';
import {
    AUDIENCE_VOTING_UI_IN_SIDEBAR_COLUMN,
    isAudienceVotingEnabled,
} from '@/lib/audienceVoting';
import { getProjectTitle } from '@/lib/projects/projectSubmissionDisplay';
import { ProjectSectionsList } from './ProjectSectionsList';
import TeamCard from './TeamCard';
import type { ProjectPageReadyState } from './types';

export function UserProjectPageView({
    teamId,
    hackathonId,
    user,
    teamData,
    response,
    projectSections,
    isOwnProject,
    alreadyVoted,
    applicationStatus,
}: ProjectPageReadyState) {
    const hackathon = useAtomValue(hackathonAtom);
    const projectTitle = getProjectTitle(
        response,
        hackathon?.submissionQuestionPages,
        `Team #${teamId}`
    );

    const audienceVoteButton = isAudienceVotingEnabled(hackathon) ? (
        <VoteButton
            projectTitle={projectTitle}
            teamId={teamId}
            hackathonId={hackathonId}
            userId={user.id}
            alreadyVoted={alreadyVoted}
            applicationStatus={applicationStatus}
        />
    ) : null;

    const voteFooter = AUDIENCE_VOTING_UI_IN_SIDEBAR_COLUMN ? (
        <div className="lg:hidden">{audienceVoteButton}</div>
    ) : (
        audienceVoteButton
    );

    return (
        <div className="flex h-full flex-col">
            <div className="m-0 flex flex-grow flex-col overflow-hidden md:-m-10 lg:m-0 lg:flex-row lg:gap-10">
                <div className="hidden h-max flex-shrink-0 flex-col gap-6 lg:flex lg:w-1/4">
                    <TeamCard teamData={teamData} isOwnProject={isOwnProject} />
                    {AUDIENCE_VOTING_UI_IN_SIDEBAR_COLUMN && audienceVoteButton}
                </div>

                <div className="lg:border-neutral-750 flex-grow overflow-y-auto p-0 md:mb-0 md:p-10 lg:rounded-xl lg:border lg:bg-neutral-900 lg:pb-0">
                    <div className="space-y-8 pb-8">
                        <ProjectSectionsList
                            sections={projectSections}
                            response={response}
                            footer={voteFooter}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
