'use client';

import JudgingDrawer from '@/components/projects/judge/JudgingDrawer';
import JudgingForm from '@/components/projects/judge/JudgingForm';
import {
    PROJECT_SUBMISSION_QUESTION_IDS,
    getProjectSubmissionText,
} from '@/lib/projects/projectSubmissionDisplay';
import { ProjectSectionsList } from './ProjectSectionsList';
import type { ProjectPageReadyState } from './types';

const Q = PROJECT_SUBMISSION_QUESTION_IDS;

export function JudgeProjectPageView({
    teamId,
    hackathonId,
    user,
    response,
    projectSections,
    didJudge,
    isAssignedToJudge,
}: ProjectPageReadyState) {
    const projectTitle =
        getProjectSubmissionText(response, Q.TITLE) || `Team #${teamId}`;

    return (
        <div className="grid h-full grid-cols-1 xl:grid-cols-3">
            <div className="h-full overflow-y-auto pb-48 md:pb-10 xl:col-span-2 xl:pb-10">
                <div className="flex flex-col gap-10 md:pr-6 xl:pr-10">
                    <ProjectSectionsList
                        sections={projectSections}
                        response={response}
                    />
                </div>
            </div>

            <div className="block xl:hidden">
                <JudgingDrawer
                    didJudge={didJudge}
                    hackathonId={hackathonId}
                    user={user}
                    teamId={teamId}
                    projectTitle={projectTitle}
                    isAssignedToJudge={isAssignedToJudge}
                />
            </div>

            <div className="h-fill relative m-0 hidden overflow-hidden bg-neutral-900 pt-10 pb-0 xl:-mt-10 xl:-mr-10 xl:-mb-10 xl:inline-flex">
                <div className="w-fill mb-20 h-full overflow-y-auto p-6 py-0 md:mb-0 xl:col-span-1 xl:p-10 xl:py-0">
                    <JudgingForm
                        hackathonId={hackathonId}
                        user={user}
                        teamId={teamId}
                        projectTitle={projectTitle}
                        didJudge={didJudge}
                        isAssignedToJudge={isAssignedToJudge}
                    />
                </div>
            </div>
        </div>
    );
}
